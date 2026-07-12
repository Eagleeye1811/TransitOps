from datetime import date

from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Actions, Modules
from app.schemas.fuel_log import FuelLogCreate, FuelLogRead, FuelLogUpdate
from app.services import expense_service

router = APIRouter(prefix="/fuel-logs", tags=["expenses"])


@router.get("", response_model=list[FuelLogRead], dependencies=[Depends(deps.require_module(Modules.EXPENSES))])
def list_fuel_logs(
    session: deps.SessionDep,
    vehicle_id: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return expense_service.list_fuel_logs(session, vehicle_id=vehicle_id, date_from=date_from, date_to=date_to)


@router.post(
    "", response_model=FuelLogRead, dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.CREATE))]
)
def create_fuel_log(payload: FuelLogCreate, session: deps.SessionDep):
    return expense_service.create_fuel_log(session, payload.model_dump())


@router.patch(
    "/{fuel_log_id}",
    response_model=FuelLogRead,
    dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.EDIT))],
)
def update_fuel_log(fuel_log_id: str, payload: FuelLogUpdate, session: deps.SessionDep):
    data = payload.model_dump(exclude_unset=True)
    return expense_service.update_fuel_log(session, fuel_log_id, data)


@router.delete(
    "/{fuel_log_id}",
    status_code=204,
    dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.DELETE))],
)
def delete_fuel_log(fuel_log_id: str, session: deps.SessionDep):
    expense_service.delete_fuel_log(session, fuel_log_id)
