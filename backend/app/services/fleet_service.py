from sqlmodel import Session, func, select

from app.core.exceptions import NotFoundError
from app.models.enums import VehicleStatus
from app.models.vehicle import Vehicle
from app.services.id_service import next_id


def list_vehicles(
    session: Session,
    *,
    status: str | None = None,
    type: str | None = None,
    region: str | None = None,
    search: str | None = None,
) -> list[Vehicle]:
    query = select(Vehicle)
    if status:
        query = query.where(Vehicle.status == status)
    if type:
        query = query.where(Vehicle.type == type)
    if region:
        query = query.where(Vehicle.region == region)
    if search:
        like = f"%{search.lower()}%"
        query = query.where(func.lower(Vehicle.registration).like(like) | func.lower(Vehicle.model).like(like))
    return list(session.exec(query.order_by(Vehicle.id)).all())


def get_vehicle(session: Session, vehicle_id: str) -> Vehicle:
    vehicle = session.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise NotFoundError(f"Vehicle {vehicle_id} not found.")
    return vehicle


def is_registration_taken(session: Session, registration: str, exclude_id: str | None = None) -> bool:
    query = select(Vehicle).where(func.lower(Vehicle.registration) == registration.lower())
    if exclude_id:
        query = query.where(Vehicle.id != exclude_id)
    return session.exec(query).first() is not None


def create_vehicle(session: Session, payload: dict) -> Vehicle:
    # SQLAlchemy 2.0 sessions "autobegin" a transaction on first use, so we
    # don't wrap this in `with session.begin()` (that would raise
    # "a transaction is already begun") — the whole function body already
    # runs inside one implicit transaction, closed by the explicit commit().
    vehicle_id = next_id(session, "VEH")
    vehicle = Vehicle(id=vehicle_id, status=VehicleStatus.AVAILABLE, utilisation=0, **payload)
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle


def update_vehicle(session: Session, vehicle_id: str, payload: dict) -> Vehicle:
    vehicle = session.get(Vehicle, vehicle_id, with_for_update=True)
    if vehicle is None:
        raise NotFoundError(f"Vehicle {vehicle_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(vehicle, key, value)
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle


def retire_vehicle(session: Session, vehicle_id: str) -> Vehicle:
    return update_vehicle(session, vehicle_id, {"status": VehicleStatus.RETIRED, "utilisation": 0})
