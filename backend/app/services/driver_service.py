from sqlmodel import Session, func, select

from app.core.exceptions import NotFoundError
from app.models.driver import Driver
from app.models.enums import DriverStatus
from app.services.id_service import next_id


def list_drivers(
    session: Session,
    *,
    status: str | None = None,
    licence_category: str | None = None,
    region: str | None = None,
    search: str | None = None,
) -> list[Driver]:
    query = select(Driver)
    if status:
        query = query.where(Driver.status == status)
    if licence_category:
        query = query.where(Driver.licence_category == licence_category)
    if region:
        query = query.where(Driver.region == region)
    if search:
        like = f"%{search.lower()}%"
        query = query.where(func.lower(Driver.name).like(like) | func.lower(Driver.licence_number).like(like))
    return list(session.exec(query.order_by(Driver.id)).all())


def get_driver(session: Session, driver_id: str) -> Driver:
    driver = session.get(Driver, driver_id)
    if driver is None:
        raise NotFoundError(f"Driver {driver_id} not found.")
    return driver


def create_driver(session: Session, payload: dict) -> Driver:
    driver_id = next_id(session, "DRV")
    driver = Driver(
        id=driver_id,
        status=DriverStatus.AVAILABLE,
        safety_score=100,
        trips_completed=0,
        current_assignment=None,
        **payload,
    )
    session.add(driver)
    session.commit()
    session.refresh(driver)
    return driver


def update_driver(session: Session, driver_id: str, payload: dict) -> Driver:
    driver = session.get(Driver, driver_id, with_for_update=True)
    if driver is None:
        raise NotFoundError(f"Driver {driver_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(driver, key, value)
    session.add(driver)
    session.commit()
    session.refresh(driver)
    return driver


def update_driver_status(session: Session, driver_id: str, status: str) -> Driver:
    return update_driver(session, driver_id, {"status": status})
