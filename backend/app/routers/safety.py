from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Actions, Modules
from app.models.enums import DriverStatus
from app.schemas.driver import DriverRead
from app.schemas.safety import (
    LicenceUpdate,
    SafetyIncidentCreate,
    SafetyIncidentRead,
    SafetyIncidentUpdate,
    SafetyViolationCreate,
    SafetyViolationRead,
    SafetyViolationUpdate,
)
from app.services import driver_service, safety_service

router = APIRouter(prefix="/safety", tags=["compliance"])


@router.get(
    "/incidents",
    response_model=list[SafetyIncidentRead],
    dependencies=[Depends(deps.require_module(Modules.COMPLIANCE))],
)
def list_incidents(session: deps.SessionDep, driver_id: str | None = None, severity: str | None = None):
    return safety_service.list_incidents(session, driver_id=driver_id, severity=severity)


@router.post(
    "/incidents",
    response_model=SafetyIncidentRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.RECORD_INCIDENT))],
)
def create_incident(payload: SafetyIncidentCreate, session: deps.SessionDep):
    return safety_service.create_incident(session, payload.model_dump())


@router.patch(
    "/incidents/{incident_id}",
    response_model=SafetyIncidentRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.RECORD_INCIDENT))],
)
def update_incident(incident_id: str, payload: SafetyIncidentUpdate, session: deps.SessionDep):
    return safety_service.update_incident(session, incident_id, payload.model_dump(exclude_unset=True))


@router.get(
    "/violations",
    response_model=list[SafetyViolationRead],
    dependencies=[Depends(deps.require_module(Modules.COMPLIANCE))],
)
def list_violations(session: deps.SessionDep, driver_id: str | None = None, status: str | None = None):
    return safety_service.list_violations(session, driver_id=driver_id, status=status)


@router.post(
    "/violations",
    response_model=SafetyViolationRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.UPDATE_VIOLATION))],
)
def create_violation(payload: SafetyViolationCreate, session: deps.SessionDep):
    return safety_service.create_violation(session, payload.model_dump())


@router.patch(
    "/violations/{violation_id}",
    response_model=SafetyViolationRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.UPDATE_VIOLATION))],
)
def update_violation(violation_id: str, payload: SafetyViolationUpdate, session: deps.SessionDep):
    return safety_service.update_violation(session, violation_id, payload.model_dump(exclude_unset=True))


@router.post(
    "/drivers/{driver_id}/suspend",
    response_model=DriverRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.SUSPEND))],
)
def suspend_driver(driver_id: str, session: deps.SessionDep):
    return driver_service.update_driver_status(session, driver_id, DriverStatus.SUSPENDED)


@router.post(
    "/drivers/{driver_id}/reactivate",
    response_model=DriverRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.REACTIVATE))],
)
def reactivate_driver(driver_id: str, session: deps.SessionDep):
    return driver_service.update_driver_status(session, driver_id, DriverStatus.AVAILABLE)


@router.patch(
    "/drivers/{driver_id}/licence",
    response_model=DriverRead,
    dependencies=[Depends(deps.require_action(Modules.COMPLIANCE, Actions.UPDATE_LICENCE))],
)
def update_driver_licence(driver_id: str, payload: LicenceUpdate, session: deps.SessionDep):
    return driver_service.update_driver(session, driver_id, {"licence_expiry": payload.licence_expiry})
