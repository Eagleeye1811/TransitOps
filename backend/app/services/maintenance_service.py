from sqlmodel import Session, func, select

from app.core.exceptions import DomainError, NotFoundError, ValidationFailedError
from app.models.enums import MaintenanceStatus, VehicleStatus
from app.models.maintenance import MaintenanceRecord
from app.models.vehicle import Vehicle
from app.services.id_service import next_id

_OPEN_STATUSES = (MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_SHOP)
_CLOSED_STATUSES = (MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED)


def list_maintenance(
    session: Session,
    *,
    vehicle_id: str | None = None,
    status: str | None = None,
    date_from=None,
    date_to=None,
) -> list[MaintenanceRecord]:
    query = select(MaintenanceRecord)
    if vehicle_id:
        query = query.where(MaintenanceRecord.vehicle_id == vehicle_id)
    if status:
        query = query.where(MaintenanceRecord.status == status)
    if date_from:
        query = query.where(MaintenanceRecord.service_date >= date_from)
    if date_to:
        query = query.where(MaintenanceRecord.service_date <= date_to)
    return list(session.exec(query.order_by(MaintenanceRecord.id)).all())


def get_maintenance(session: Session, record_id: str) -> MaintenanceRecord:
    record = session.get(MaintenanceRecord, record_id)
    if record is None:
        raise NotFoundError(f"Maintenance record {record_id} not found.")
    return record


def create_maintenance(session: Session, payload: dict) -> MaintenanceRecord:
    """Creating (== scheduling) a maintenance record immediately locks the
    vehicle into the maintenance workflow — the "Automatic status
    transitions" mandatory deliverable, extended to a coupling the original
    frontend mock never had (maintenanceService.js never touched vehicle
    status). Rejected if the vehicle is currently on a dispatched trip.
    """
    vehicle = session.get(Vehicle, payload["vehicle_id"], with_for_update=True)
    if vehicle is None:
        raise NotFoundError(f"Vehicle {payload['vehicle_id']} not found.")
    if vehicle.status == VehicleStatus.ON_TRIP:
        raise ValidationFailedError(
            [f"{vehicle.registration} is currently on a dispatched trip and cannot be sent to maintenance."]
        )
    if vehicle.status == VehicleStatus.RETIRED:
        raise ValidationFailedError([f"{vehicle.registration} is retired and cannot be scheduled for maintenance."])

    record_id = next_id(session, "MNT")
    record = MaintenanceRecord(id=record_id, status=MaintenanceStatus.SCHEDULED, **payload)
    session.add(record)

    if vehicle.status != VehicleStatus.IN_SHOP:
        vehicle.status = VehicleStatus.IN_SHOP
        session.add(vehicle)

    session.commit()
    session.refresh(record)
    return record


def update_maintenance(session: Session, record_id: str, payload: dict) -> MaintenanceRecord:
    record = session.get(MaintenanceRecord, record_id, with_for_update=True)
    if record is None:
        raise NotFoundError(f"Maintenance record {record_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(record, key, value)
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def set_maintenance_status(session: Session, record_id: str, new_status: str) -> MaintenanceRecord:
    """The other half of the vehicle<->maintenance coupling: completing or
    cancelling a maintenance record frees the vehicle back to `available`
    ONLY if no other open (scheduled/in_shop) record still references it —
    handles overlapping maintenance records on one vehicle without
    prematurely freeing it mid-service.
    """
    record = session.get(MaintenanceRecord, record_id, with_for_update=True)
    if record is None:
        raise NotFoundError(f"Maintenance record {record_id} not found.")
    if record.status in _CLOSED_STATUSES:
        raise DomainError(f"Maintenance record {record_id} is already '{record.status}'.")
    if new_status not in _CLOSED_STATUSES:
        raise DomainError(f"Use update_maintenance for transitions other than complete/cancel (got '{new_status}').")

    record.status = new_status
    session.add(record)

    vehicle = session.get(Vehicle, record.vehicle_id, with_for_update=True)
    if vehicle and vehicle.status == VehicleStatus.IN_SHOP:
        other_open = session.exec(
            select(func.count())
            .select_from(MaintenanceRecord)
            .where(
                MaintenanceRecord.vehicle_id == vehicle.id,
                MaintenanceRecord.id != record.id,
                MaintenanceRecord.status.in_(_OPEN_STATUSES),
            )
        ).one()
        if other_open == 0:
            vehicle.status = VehicleStatus.AVAILABLE
            session.add(vehicle)

    session.commit()
    session.refresh(record)
    return record


def complete_maintenance(session: Session, record_id: str) -> MaintenanceRecord:
    return set_maintenance_status(session, record_id, MaintenanceStatus.COMPLETED)


def cancel_maintenance(session: Session, record_id: str) -> MaintenanceRecord:
    return set_maintenance_status(session, record_id, MaintenanceStatus.CANCELLED)
