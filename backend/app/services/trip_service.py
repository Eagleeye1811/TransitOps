from datetime import datetime

from sqlmodel import Session, func, select

from app.core.exceptions import DomainError, NotFoundError, ValidationFailedError
from app.models.driver import Driver
from app.models.enums import DriverStatus, TripStatus, VehicleStatus
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.services.id_service import next_id


def _active_assignment_maps(session: Session, exclude_trip_id: str | None = None) -> tuple[dict, dict]:
    """vehicle_id/driver_id -> trip_id for every currently DISPATCHED trip
    (excluding the trip being re-validated, if any) — mirrors
    tripService.js's `activeAssignmentMaps()` exactly.
    """
    trips = session.exec(select(Trip).where(Trip.status == TripStatus.DISPATCHED)).all()
    by_vehicle: dict[str, str] = {}
    by_driver: dict[str, str] = {}
    for trip in trips:
        if exclude_trip_id and trip.id == exclude_trip_id:
            continue
        if trip.vehicle_id:
            by_vehicle[trip.vehicle_id] = trip.id
        if trip.driver_id:
            by_driver[trip.driver_id] = trip.id
    return by_vehicle, by_driver


def validate_assignment(
    session: Session,
    *,
    vehicle_id: str | None = None,
    driver_id: str | None = None,
    cargo_weight_kg: int | None = None,
    exclude_trip_id: str | None = None,
) -> tuple[bool, list[str]]:
    """Accumulate-all-errors port of frontend/src/utils/validators.js
    `validateTripAssignment` — never fail-fast, always report every
    violated rule so the UI can show the complete list at once.
    """
    errors: list[str] = []
    vehicle = session.get(Vehicle, vehicle_id) if vehicle_id else None
    driver = session.get(Driver, driver_id) if driver_id else None
    by_vehicle, by_driver = _active_assignment_maps(session, exclude_trip_id)

    if vehicle:
        if vehicle.status == VehicleStatus.RETIRED:
            errors.append(f"{vehicle.registration} is retired and cannot be assigned.")
        if vehicle.status == VehicleStatus.IN_SHOP:
            errors.append(f"{vehicle.registration} is currently in maintenance and cannot be assigned.")
        conflict = by_vehicle.get(vehicle.id)
        if conflict:
            errors.append(f"{vehicle.registration} is already assigned to an active trip ({conflict}).")
        if cargo_weight_kg and cargo_weight_kg > vehicle.capacity_kg:
            over = cargo_weight_kg - vehicle.capacity_kg
            errors.append(
                f"Cargo weight ({cargo_weight_kg} kg) exceeds vehicle capacity "
                f"({vehicle.capacity_kg} kg) by {over} kg."
            )

    if driver:
        if driver.status == DriverStatus.SUSPENDED:
            errors.append(f"{driver.name} is suspended and cannot be assigned.")
        if driver.status == DriverStatus.OFF_DUTY:
            errors.append(f"{driver.name} is off duty and cannot be assigned.")
        conflict = by_driver.get(driver.id)
        if conflict:
            errors.append(f"{driver.name} is already assigned to an active trip ({conflict}).")

    return len(errors) == 0, errors


def list_trips(
    session: Session,
    *,
    status: str | None = None,
    search: str | None = None,
    date_from=None,
    date_to=None,
) -> list[Trip]:
    query = select(Trip)
    if status:
        query = query.where(Trip.status == status)
    if date_from:
        query = query.where(Trip.scheduled_date >= date_from)
    if date_to:
        query = query.where(Trip.scheduled_date <= date_to)
    if search:
        like = f"%{search.lower()}%"
        query = query.where(
            func.lower(Trip.source).like(like)
            | func.lower(Trip.destination).like(like)
            | func.lower(Trip.id).like(like)
        )
    return list(session.exec(query.order_by(Trip.id)).all())


def get_trip(session: Session, trip_id: str) -> Trip:
    trip = session.get(Trip, trip_id)
    if trip is None:
        raise NotFoundError(f"Trip {trip_id} not found.")
    return trip


def create_trip(session: Session, payload: dict) -> Trip:
    trip_id = next_id(session, "TRIP")
    trip = Trip(id=trip_id, status=TripStatus.DRAFT, **payload)
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


def update_trip(session: Session, trip_id: str, payload: dict) -> Trip:
    trip = session.get(Trip, trip_id, with_for_update=True)
    if trip is None:
        raise NotFoundError(f"Trip {trip_id} not found.")
    if trip.status != TripStatus.DRAFT:
        raise DomainError("Only draft trips can be edited.")
    for key, value in payload.items():
        if value is not None:
            setattr(trip, key, value)
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


def dispatch_trip(session: Session, trip_id: str) -> Trip:
    """The mandatory-deliverable centerpiece: validate -> flip trip status ->
    cascade vehicle/driver status, all inside one transaction with row locks
    on every row involved, so two concurrent dispatch requests referencing
    the same vehicle/driver can't both succeed (the single-threaded JS mock
    this replaces could never exhibit that race; a real multi-request
    backend can).
    """
    trip = session.get(Trip, trip_id, with_for_update=True)
    if trip is None:
        raise NotFoundError(f"Trip {trip_id} not found.")
    if trip.status != TripStatus.DRAFT:
        raise DomainError(f"Trip {trip_id} is '{trip.status}' — only draft trips can be dispatched.")

    vehicle = session.get(Vehicle, trip.vehicle_id, with_for_update=True) if trip.vehicle_id else None
    driver = session.get(Driver, trip.driver_id, with_for_update=True) if trip.driver_id else None

    errors: list[str] = []
    if not trip.vehicle_id or not trip.driver_id:
        errors.append("Both a vehicle and a driver must be assigned before dispatch.")

    _, validation_errors = validate_assignment(
        session,
        vehicle_id=trip.vehicle_id,
        driver_id=trip.driver_id,
        cargo_weight_kg=trip.cargo_weight_kg,
        exclude_trip_id=trip.id,
    )
    errors.extend(validation_errors)

    if errors:
        raise ValidationFailedError(errors)

    trip.status = TripStatus.DISPATCHED
    trip.dispatched_at = datetime.utcnow()
    vehicle.status = VehicleStatus.ON_TRIP
    driver.status = DriverStatus.ON_TRIP
    driver.current_assignment = trip.id

    session.add_all([trip, vehicle, driver])
    session.commit()
    session.refresh(trip)
    return trip


def cancel_trip(session: Session, trip_id: str, reason: str | None) -> Trip:
    trip = session.get(Trip, trip_id, with_for_update=True)
    if trip is None:
        raise NotFoundError(f"Trip {trip_id} not found.")
    if trip.status in (TripStatus.COMPLETED, TripStatus.CANCELLED):
        raise DomainError(f"Trip {trip_id} is already '{trip.status}' and cannot be cancelled.")

    was_dispatched = trip.status == TripStatus.DISPATCHED
    trip.status = TripStatus.CANCELLED
    trip.cancel_reason = reason or "No reason provided"
    session.add(trip)

    if was_dispatched:
        if trip.vehicle_id:
            vehicle = session.get(Vehicle, trip.vehicle_id, with_for_update=True)
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE
                session.add(vehicle)
        if trip.driver_id:
            driver = session.get(Driver, trip.driver_id, with_for_update=True)
            if driver:
                driver.status = DriverStatus.AVAILABLE
                driver.current_assignment = None
                session.add(driver)

    session.commit()
    session.refresh(trip)
    return trip


def complete_trip(session: Session, trip_id: str) -> Trip:
    trip = session.get(Trip, trip_id, with_for_update=True)
    if trip is None:
        raise NotFoundError(f"Trip {trip_id} not found.")
    if trip.status != TripStatus.DISPATCHED:
        raise DomainError(f"Trip {trip_id} is '{trip.status}' — only dispatched trips can be completed.")

    trip.status = TripStatus.COMPLETED
    trip.completed_at = datetime.utcnow()
    session.add(trip)

    if trip.vehicle_id:
        vehicle = session.get(Vehicle, trip.vehicle_id, with_for_update=True)
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
            session.add(vehicle)
    if trip.driver_id:
        driver = session.get(Driver, trip.driver_id, with_for_update=True)
        if driver:
            driver.status = DriverStatus.AVAILABLE
            driver.current_assignment = None
            driver.trips_completed = (driver.trips_completed or 0) + 1
            session.add(driver)

    session.commit()
    session.refresh(trip)
    return trip
