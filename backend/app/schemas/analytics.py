from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    """Response shape for GET /analytics/summary.

    Most trend series carry real historical data where the schema supports
    it (top lists, category breakdowns). A handful (fleet_utilisation_trend,
    safety_score_trend, suspended_driver_trend, fuel_efficiency_trend,
    maintenance_trend) are single-point "Current" snapshots — this schema
    has no historical snapshot table, so true month-over-month trending is
    out of scope for this bonus feature. revenue_trend is always empty:
    there is no revenue/booking-value concept anywhere in this operations
    schema, so we don't fabricate one server-side.

    Series are typed as list[dict] rather than per-series Pydantic models —
    each dict's keys exactly mirror the frontend's static mock shape in
    frontend/src/data/analytics.js so the page needs minimal changes to
    consume this instead of the static import.
    """

    fleet_utilisation_trend: list[dict]
    top_costliest_vehicles: list[dict]
    expense_by_category: list[dict]
    vehicle_type_breakdown: list[dict]
    underutilised_vehicles: list[dict]
    safety_score_trend: list[dict]
    suspended_driver_trend: list[dict]
    fuel_efficiency_trend: list[dict]
    maintenance_trend: list[dict]
    revenue_trend: list[dict]
    repeated_breakdowns: list[dict]

    # Role-relevant scalars (financial_analytics / safety_reports roles).
    total_fuel_cost: float
    total_maintenance_cost: float
    total_expense_cost: float
    avg_cost_per_vehicle: float
    avg_vehicle_roi: float
    expiring_licences_count: int
    expired_licences_count: int
    open_incidents_count: int
    open_violations_count: int
