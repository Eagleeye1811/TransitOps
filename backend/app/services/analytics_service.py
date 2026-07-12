"""Live analytics aggregation — replaces the frontend's static mock chart
data (frontend/src/data/analytics.js) with numbers computed from the actual
database.

A few series (fleet_utilisation_trend, safety_score_trend,
suspended_driver_trend, fuel_efficiency_trend, maintenance_trend) are
single-point "Current" snapshots rather than true month-over-month trends:
this schema has no historical snapshot table (vehicle.utilisation,
driver.safety_score etc. are point-in-time columns, not time series), so
building real trending would require a new snapshot table — out of scope
for this bonus feature. revenue_trend is always an empty list: there is no
revenue/booking-value concept anywhere in this operations schema, so we
don't fabricate one server-side (the frontend mock invented plausible
numbers; we don't).
"""

from datetime import date, timedelta
from decimal import Decimal

from sqlmodel import Session, func, select

from app.models.driver import Driver
from app.models.enums import DriverStatus, MaintenanceStatus, TripStatus, VehicleStatus
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.maintenance import MaintenanceRecord
from app.models.safety import SafetyIncident, SafetyViolation
from app.models.trip import Trip
from app.models.vehicle import Vehicle


def _f(value: Decimal | float | None) -> float:
    """Decimal/None-safe float coercion for aggregate query results."""
    return float(value) if value is not None else 0.0


def get_summary(session: Session) -> dict:
    active_vehicles = list(
        session.exec(select(Vehicle).where(Vehicle.status != VehicleStatus.RETIRED)).all()
    )
    all_vehicles_by_id = {v.id: v for v in session.exec(select(Vehicle)).all()}

    # --- Fleet utilisation trend: single current data point (no snapshot
    # history exists) — avg utilisation across non-retired vehicles. ---
    avg_utilisation = (
        sum(v.utilisation for v in active_vehicles) / len(active_vehicles) if active_vehicles else 0
    )
    fleet_utilisation_trend = [{"month": "Current", "utilisation": round(avg_utilisation, 1)}]

    # --- Top costliest vehicles: real query — sum MaintenanceRecord.cost +
    # FuelLog.cost per vehicle, joined to Vehicle.registration for the label. ---
    maint_cost_by_vehicle = dict(
        session.exec(
            select(MaintenanceRecord.vehicle_id, func.sum(MaintenanceRecord.cost)).group_by(
                MaintenanceRecord.vehicle_id
            )
        ).all()
    )
    fuel_cost_by_vehicle = dict(
        session.exec(select(FuelLog.vehicle_id, func.sum(FuelLog.cost)).group_by(FuelLog.vehicle_id)).all()
    )
    combined_vehicle_ids = set(maint_cost_by_vehicle) | set(fuel_cost_by_vehicle)
    combined_costs = []
    for vehicle_id in combined_vehicle_ids:
        vehicle = all_vehicles_by_id.get(vehicle_id)
        label = vehicle.registration if vehicle else vehicle_id
        cost = _f(maint_cost_by_vehicle.get(vehicle_id)) + _f(fuel_cost_by_vehicle.get(vehicle_id))
        combined_costs.append({"vehicle": label, "cost": round(cost, 2)})
    top_costliest_vehicles = sorted(combined_costs, key=lambda row: row["cost"], reverse=True)[:5]

    # --- Top vehicles by ROI: separate ranking from top_costliest_vehicles
    # (highest cost, not highest return) — used by the Financial Analytics
    # "Vehicle ROI" chart, which otherwise has no live data source for a
    # role with no Fleet/Trips module access to fetch vehicles/trips itself. ---
    top_vehicles_by_roi = [
        {"vehicle": v.registration, "roi": _f(v.roi)}
        for v in sorted(active_vehicles, key=lambda v: _f(v.roi), reverse=True)[:5]
    ]

    # --- Expense by category: real Expense rows grouped by category, plus
    # synthetic Fuel / Maintenance categories mirroring the frontend mock's
    # blended category list. ---
    total_fuel_cost = _f(session.exec(select(func.sum(FuelLog.cost))).one())
    total_maintenance_cost = _f(session.exec(select(func.sum(MaintenanceRecord.cost))).one())
    total_expense_cost = _f(session.exec(select(func.sum(Expense.amount))).one())

    expense_rows = session.exec(select(Expense.category, func.sum(Expense.amount)).group_by(Expense.category)).all()
    # Accumulate into a dict (rather than just appending) so a real Expense
    # category that happens to also be named "Fuel"/"Maintenance" gets
    # merged into one blended total instead of producing a duplicate
    # category key (which would render as two overlapping pie slices).
    category_totals: dict[str, float] = {}
    for category, amount in expense_rows:
        category_totals[category] = category_totals.get(category, 0.0) + _f(amount)
    if total_fuel_cost:
        category_totals["Fuel"] = category_totals.get("Fuel", 0.0) + total_fuel_cost
    if total_maintenance_cost:
        category_totals["Maintenance"] = category_totals.get("Maintenance", 0.0) + total_maintenance_cost
    expense_by_category = [{"category": category, "amount": round(amount, 2)} for category, amount in category_totals.items()]

    # --- Vehicle type breakdown: Vehicle grouped by type, non-retired only. ---
    type_rows = session.exec(
        select(Vehicle.type, func.count())
        .where(Vehicle.status != VehicleStatus.RETIRED)
        .group_by(Vehicle.type)
    ).all()
    vehicle_type_breakdown = [{"type": vtype, "count": count} for vtype, count in type_rows]

    # --- Underutilised vehicles: non-retired, ascending utilisation, top 5. ---
    underutilised = sorted(active_vehicles, key=lambda v: v.utilisation)[:5]
    underutilised_vehicles = [
        {"vehicle": f"{v.registration} ({v.model})", "utilisation": int(v.utilisation)} for v in underutilised
    ]

    # --- Safety score trend: single current data point. ---
    drivers = list(session.exec(select(Driver)).all())
    avg_safety_score = sum(d.safety_score for d in drivers) / len(drivers) if drivers else 0
    safety_score_trend = [{"month": "Current", "avgScore": round(avg_safety_score, 1)}]

    # --- Suspended driver trend: single current data point. ---
    suspended_count = session.exec(
        select(func.count()).select_from(Driver).where(Driver.status == DriverStatus.SUSPENDED)
    ).one()
    suspended_driver_trend = [{"month": "Current", "suspended": suspended_count}]

    # --- Fuel efficiency trend: single current-period estimate — total
    # planned distance of completed trips / total fuel litres logged. ---
    total_distance = _f(
        session.exec(select(func.sum(Trip.planned_distance_km)).where(Trip.status == TripStatus.COMPLETED)).one()
    )
    total_litres = _f(session.exec(select(func.sum(FuelLog.quantity_litres))).one())
    kmpl = round(total_distance / total_litres, 2) if total_litres else 0.0
    fuel_efficiency_trend = [{"month": "Current", "kmpl": kmpl}]

    # --- Maintenance trend: single current data point. ---
    incidents_count = session.exec(
        select(func.count())
        .select_from(MaintenanceRecord)
        .where(MaintenanceRecord.status != MaintenanceStatus.CANCELLED)
    ).one()
    maintenance_trend = [
        {"month": "Current", "cost": round(total_maintenance_cost, 2), "incidents": incidents_count}
    ]

    # --- Revenue trend: not a real concept in this schema (operations, not
    # billing) — deliberately empty rather than fabricated. ---
    revenue_trend: list[dict] = []

    # --- Repeated breakdowns: vehicles with 2+ maintenance records, top 5. ---
    breakdown_rows = session.exec(
        select(MaintenanceRecord.vehicle_id, func.count())
        .group_by(MaintenanceRecord.vehicle_id)
        .having(func.count() >= 2)
    ).all()
    repeated_breakdowns = []
    for vehicle_id, count in breakdown_rows:
        vehicle = all_vehicles_by_id.get(vehicle_id)
        label = f"{vehicle.registration} ({vehicle.model})" if vehicle else vehicle_id
        repeated_breakdowns.append({"vehicle": label, "incidents": count})
    repeated_breakdowns.sort(key=lambda row: row["incidents"], reverse=True)
    repeated_breakdowns = repeated_breakdowns[:5]

    # --- Role-relevant scalars. ---
    avg_cost_per_vehicle = (
        sum(_f(v.operational_cost_monthly) for v in active_vehicles) / len(active_vehicles) if active_vehicles else 0.0
    )
    avg_vehicle_roi = sum(_f(v.roi) for v in active_vehicles) / len(active_vehicles) if active_vehicles else 0.0

    today = date.today()
    expiring_cutoff = today + timedelta(days=60)
    expiring_licences_count = session.exec(
        select(func.count())
        .select_from(Driver)
        .where(Driver.licence_expiry >= today, Driver.licence_expiry <= expiring_cutoff)
    ).one()
    expired_licences_count = session.exec(
        select(func.count()).select_from(Driver).where(Driver.licence_expiry < today)
    ).one()

    open_incidents_count = session.exec(
        select(func.count()).select_from(SafetyIncident).where(SafetyIncident.status == "under_review")
    ).one()
    open_violations_count = session.exec(
        select(func.count()).select_from(SafetyViolation).where(SafetyViolation.status == "open")
    ).one()

    # financial_analytics role has no Trips/Drivers module access, so "cost
    # per trip" needs this computed server-side rather than fetched client-side.
    total_trips_completed = session.exec(
        select(func.count()).select_from(Trip).where(Trip.status == TripStatus.COMPLETED)
    ).one()

    return {
        "fleet_utilisation_trend": fleet_utilisation_trend,
        "top_costliest_vehicles": top_costliest_vehicles,
        "top_vehicles_by_roi": top_vehicles_by_roi,
        "expense_by_category": expense_by_category,
        "vehicle_type_breakdown": vehicle_type_breakdown,
        "underutilised_vehicles": underutilised_vehicles,
        "safety_score_trend": safety_score_trend,
        "suspended_driver_trend": suspended_driver_trend,
        "fuel_efficiency_trend": fuel_efficiency_trend,
        "maintenance_trend": maintenance_trend,
        "revenue_trend": revenue_trend,
        "repeated_breakdowns": repeated_breakdowns,
        "total_fuel_cost": round(total_fuel_cost, 2),
        "total_maintenance_cost": round(total_maintenance_cost, 2),
        "total_expense_cost": round(total_expense_cost, 2),
        "avg_cost_per_vehicle": round(avg_cost_per_vehicle, 2),
        "avg_vehicle_roi": round(avg_vehicle_roi, 2),
        "total_trips_completed": total_trips_completed,
        "expiring_licences_count": expiring_licences_count,
        "expired_licences_count": expired_licences_count,
        "open_incidents_count": open_incidents_count,
        "open_violations_count": open_violations_count,
    }
