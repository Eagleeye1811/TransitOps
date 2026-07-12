from datetime import date

from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Actions, Modules
from app.schemas.maintenance import MaintenanceCreate, MaintenanceRead, MaintenanceUpdate
from app.services import maintenance_service

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("", response_model=list[MaintenanceRead], dependencies=[Depends(deps.require_module(Modules.MAINTENANCE))])
def list_maintenance(
    session: deps.SessionDep,
    vehicle_id: str | None = None,
    status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return maintenance_service.list_maintenance(
        session, vehicle_id=vehicle_id, status=status, date_from=date_from, date_to=date_to
    )


@router.get(
    "/{record_id}", response_model=MaintenanceRead, dependencies=[Depends(deps.require_module(Modules.MAINTENANCE))]
)
def get_maintenance(record_id: str, session: deps.SessionDep):
    return maintenance_service.get_maintenance(session, record_id)


@router.post(
    "",
    response_model=MaintenanceRead,
    dependencies=[Depends(deps.require_action(Modules.MAINTENANCE, Actions.CREATE))],
)
def create_maintenance(payload: MaintenanceCreate, session: deps.SessionDep):
    return maintenance_service.create_maintenance(session, payload.model_dump())


@router.patch(
    "/{record_id}",
    response_model=MaintenanceRead,
    dependencies=[Depends(deps.require_action(Modules.MAINTENANCE, Actions.EDIT))],
)
def update_maintenance(record_id: str, payload: MaintenanceUpdate, session: deps.SessionDep):
    return maintenance_service.update_maintenance(session, record_id, payload.model_dump(exclude_unset=True))


@router.post(
    "/{record_id}/complete",
    response_model=MaintenanceRead,
    dependencies=[Depends(deps.require_action(Modules.MAINTENANCE, Actions.COMPLETE))],
)
def complete_maintenance(record_id: str, session: deps.SessionDep):
    return maintenance_service.complete_maintenance(session, record_id)


@router.post(
    "/{record_id}/cancel",
    response_model=MaintenanceRead,
    dependencies=[Depends(deps.require_action(Modules.MAINTENANCE, Actions.CANCEL))],
)
def cancel_maintenance(record_id: str, session: deps.SessionDep):
    return maintenance_service.cancel_maintenance(session, record_id)
