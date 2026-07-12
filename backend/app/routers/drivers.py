from fastapi import APIRouter, Depends

from app import deps
from app.core.exceptions import DomainError
from app.core.permissions import Actions, Modules, can_perform_action
from app.models.enums import DriverStatus
from app.schemas.driver import DriverCreate, DriverRead, DriverStatusUpdate, DriverUpdate
from app.services import driver_service

router = APIRouter(prefix="/drivers", tags=["drivers"])

# Which action(s) authorize transitioning a driver TO this status. Any one
# of the listed actions is sufficient (mirrors the frontend's action set per
# role — Safety Officer has both REACTIVATE and MARK_AVAILABLE, for example).
_STATUS_ACTIONS = {
    DriverStatus.SUSPENDED: [Actions.SUSPEND],
    DriverStatus.AVAILABLE: [Actions.REACTIVATE, Actions.MARK_AVAILABLE],
    DriverStatus.OFF_DUTY: [Actions.MARK_OFF_DUTY],
    # ON_TRIP is only ever set as a side effect of trip dispatch (trip_service),
    # never via this endpoint directly.
}


@router.get("", response_model=list[DriverRead], dependencies=[Depends(deps.require_module(Modules.DRIVERS))])
def list_drivers(
    session: deps.SessionDep,
    status: str | None = None,
    licence_category: str | None = None,
    region: str | None = None,
    search: str | None = None,
):
    return driver_service.list_drivers(
        session, status=status, licence_category=licence_category, region=region, search=search
    )


@router.get("/{driver_id}", response_model=DriverRead, dependencies=[Depends(deps.require_module(Modules.DRIVERS))])
def get_driver(driver_id: str, session: deps.SessionDep):
    return driver_service.get_driver(session, driver_id)


@router.post("", response_model=DriverRead, dependencies=[Depends(deps.require_action(Modules.DRIVERS, Actions.CREATE))])
def create_driver(payload: DriverCreate, session: deps.SessionDep):
    return driver_service.create_driver(session, payload.model_dump())


@router.patch("/{driver_id}", response_model=DriverRead)
def update_driver(driver_id: str, payload: DriverUpdate, session: deps.SessionDep, user: deps.CurrentUserDep):
    """Admin/Safety Officer get full EDIT; Fleet Manager gets EDIT_OPERATIONAL
    (contact field only) — mirrors the frontend's DriverForm "operational
    mode" split, enforced server-side rather than trusted from the client.
    """
    has_full_edit = can_perform_action(user.role, Modules.DRIVERS, Actions.EDIT)
    has_operational_edit = can_perform_action(user.role, Modules.DRIVERS, Actions.EDIT_OPERATIONAL)
    if not (has_full_edit or has_operational_edit):
        raise DomainError("You do not have permission to edit drivers.")

    data = payload.model_dump(exclude_unset=True)
    if not has_full_edit:
        disallowed = set(data) - {"contact"}
        if disallowed:
            raise DomainError(f"Your role can only update the contact field (attempted: {', '.join(disallowed)}).")

    return driver_service.update_driver(session, driver_id, data)


@router.patch("/{driver_id}/status", response_model=DriverRead)
def update_driver_status(driver_id: str, payload: DriverStatusUpdate, session: deps.SessionDep, user: deps.CurrentUserDep):
    allowed_actions = _STATUS_ACTIONS.get(payload.status)
    if not allowed_actions:
        raise DomainError(f"Cannot set driver status to '{payload.status}' directly.")
    if not any(can_perform_action(user.role, Modules.DRIVERS, action) for action in allowed_actions):
        raise DomainError("You do not have permission to change this driver's status.")

    return driver_service.update_driver_status(session, driver_id, payload.status)
