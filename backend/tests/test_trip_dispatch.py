from datetime import date, time

from app.models.enums import DriverStatus, VehicleStatus
from app.models.trip import Trip
from app.services import trip_service


def _make_trip(session, **overrides):
    defaults = dict(
        id="TRIP-TEST",
        source="A",
        destination="B",
        vehicle_id="VEH-001",
        driver_id="DRV-001",
        cargo_weight_kg=100,
        planned_distance_km=10,
        region="Ahmedabad",
        scheduled_date=date(2026, 8, 1),
        scheduled_time=time(9, 0, 0),
        status="draft",
    )
    defaults.update(overrides)
    trip = Trip(**defaults)
    session.add(trip)
    session.commit()
    return trip


def test_dispatch_requires_both_vehicle_and_driver(session, seed_minimal):
    _make_trip(session, id="TRIP-A", vehicle_id=None, driver_id=None)
    try:
        trip_service.dispatch_trip(session, "TRIP-A")
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "vehicle and a driver" in str(exc)


def test_dispatch_rejects_cargo_over_capacity(session, seed_minimal):
    # VEH-001 capacity is 500kg per the seed_minimal fixture
    _make_trip(session, id="TRIP-B", cargo_weight_kg=900)
    try:
        trip_service.dispatch_trip(session, "TRIP-B")
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "exceeds vehicle capacity" in str(exc)


def test_dispatch_rejects_retired_vehicle(session, seed_minimal):
    _make_trip(session, id="TRIP-C", vehicle_id="VEH-002")  # VEH-002 is retired
    try:
        trip_service.dispatch_trip(session, "TRIP-C")
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "retired" in str(exc)


def test_dispatch_rejects_suspended_driver(session, seed_minimal):
    _make_trip(session, id="TRIP-D", driver_id="DRV-002")  # DRV-002 is suspended
    try:
        trip_service.dispatch_trip(session, "TRIP-D")
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "suspended" in str(exc)


def test_dispatch_success_cascades_status(session, seed_minimal):
    _make_trip(session, id="TRIP-E")
    trip = trip_service.dispatch_trip(session, "TRIP-E")

    assert trip.status == "dispatched"
    assert trip.dispatched_at is not None

    from app.models.driver import Driver
    from app.models.vehicle import Vehicle

    vehicle = session.get(Vehicle, "VEH-001")
    driver = session.get(Driver, "DRV-001")
    assert vehicle.status == VehicleStatus.ON_TRIP
    assert driver.status == DriverStatus.ON_TRIP
    assert driver.current_assignment == "TRIP-E"


def test_double_dispatch_same_vehicle_rejected(session, seed_minimal):
    """Not a true multi-threaded race (SQLite test fixture shares one
    session) — this instead verifies the conflict-detection LOGIC itself:
    once a vehicle is on a DISPATCHED trip, a second draft trip referencing
    the same vehicle must be rejected. Real concurrent-request safety comes
    from the `with_for_update` row locks in trip_service, which only take
    effect against a real multi-connection database (Postgres/Neon) — that
    guarantee is documented, not re-provable under SQLite's single-writer
    model.
    """
    _make_trip(session, id="TRIP-F")
    trip_service.dispatch_trip(session, "TRIP-F")

    _make_trip(session, id="TRIP-G", driver_id=None)  # same VEH-001, different/no driver
    try:
        trip_service.dispatch_trip(session, "TRIP-G")
        assert False, "expected ValidationFailedError"
    except Exception as exc:
        assert "already assigned to an active trip" in str(exc)


def test_complete_trip_frees_vehicle_and_driver(session, seed_minimal):
    _make_trip(session, id="TRIP-H")
    trip_service.dispatch_trip(session, "TRIP-H")
    trip = trip_service.complete_trip(session, "TRIP-H")

    assert trip.status == "completed"
    assert trip.completed_at is not None

    from app.models.driver import Driver
    from app.models.vehicle import Vehicle

    vehicle = session.get(Vehicle, "VEH-001")
    driver = session.get(Driver, "DRV-001")
    assert vehicle.status == VehicleStatus.AVAILABLE
    assert driver.status == DriverStatus.AVAILABLE
    assert driver.current_assignment is None


def test_cancel_dispatched_trip_frees_resources(session, seed_minimal):
    _make_trip(session, id="TRIP-I")
    trip_service.dispatch_trip(session, "TRIP-I")
    trip = trip_service.cancel_trip(session, "TRIP-I", "Customer cancelled")

    assert trip.status == "cancelled"
    assert trip.cancel_reason == "Customer cancelled"

    from app.models.vehicle import Vehicle

    vehicle = session.get(Vehicle, "VEH-001")
    assert vehicle.status == VehicleStatus.AVAILABLE
