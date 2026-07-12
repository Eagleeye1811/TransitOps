from datetime import date, time

from app.models.driver import Driver
from app.models.enums import DriverStatus, TripStatus, VehicleStatus
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.services import maintenance_service, trip_service


def test_create_maintenance_flips_vehicle_to_in_shop(session, seed_minimal):
    record = maintenance_service.create_maintenance(
        session,
        {"vehicle_id": "VEH-001", "service_type": "Oil Change", "cost": 1000, "service_date": date(2026, 8, 1)},
    )
    vehicle = session.get(Vehicle, "VEH-001")
    assert vehicle.status == VehicleStatus.IN_SHOP
    assert record.status == "scheduled"


def test_create_maintenance_rejects_on_trip_vehicle(session, seed_minimal):
    session.add(
        Trip(
            id="TRIP-X", source="A", destination="B", vehicle_id="VEH-001", driver_id="DRV-001",
            cargo_weight_kg=50, planned_distance_km=5, region="Ahmedabad", scheduled_date=date(2026, 8, 1),
            scheduled_time=time(9, 0, 0), status=TripStatus.DISPATCHED,
        )
    )
    vehicle = session.get(Vehicle, "VEH-001")
    vehicle.status = VehicleStatus.ON_TRIP
    session.add(vehicle)
    session.commit()

    try:
        maintenance_service.create_maintenance(
            session,
            {"vehicle_id": "VEH-001", "service_type": "Oil Change", "cost": 500, "service_date": date(2026, 8, 1)},
        )
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "dispatched trip" in str(exc)


def test_complete_maintenance_frees_vehicle_when_no_other_open_records(session, seed_minimal):
    record = maintenance_service.create_maintenance(
        session,
        {"vehicle_id": "VEH-001", "service_type": "Oil Change", "cost": 1000, "service_date": date(2026, 8, 1)},
    )
    updated = maintenance_service.complete_maintenance(session, record.id)
    assert updated.status == "completed"

    vehicle = session.get(Vehicle, "VEH-001")
    assert vehicle.status == VehicleStatus.AVAILABLE


def test_vehicle_stays_in_shop_while_another_record_is_open(session, seed_minimal):
    first = maintenance_service.create_maintenance(
        session,
        {"vehicle_id": "VEH-001", "service_type": "Oil Change", "cost": 500, "service_date": date(2026, 8, 1)},
    )
    second = maintenance_service.create_maintenance(
        session,
        {"vehicle_id": "VEH-001", "service_type": "Brake Service", "cost": 800, "service_date": date(2026, 8, 2)},
    )

    maintenance_service.complete_maintenance(session, first.id)
    vehicle = session.get(Vehicle, "VEH-001")
    assert vehicle.status == VehicleStatus.IN_SHOP  # second record still open

    maintenance_service.complete_maintenance(session, second.id)
    vehicle = session.get(Vehicle, "VEH-001")
    assert vehicle.status == VehicleStatus.AVAILABLE
