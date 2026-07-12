from datetime import date

from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Actions, Modules
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=list[ExpenseRead], dependencies=[Depends(deps.require_module(Modules.EXPENSES))])
def list_expenses(
    session: deps.SessionDep,
    vehicle_id: str | None = None,
    trip_id: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return expense_service.list_expenses(
        session, vehicle_id=vehicle_id, trip_id=trip_id, category=category, date_from=date_from, date_to=date_to
    )


@router.post(
    "", response_model=ExpenseRead, dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.CREATE))]
)
def create_expense(payload: ExpenseCreate, session: deps.SessionDep):
    return expense_service.create_expense(session, payload.model_dump())


@router.patch(
    "/{expense_id}",
    response_model=ExpenseRead,
    dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.EDIT))],
)
def update_expense(expense_id: str, payload: ExpenseUpdate, session: deps.SessionDep):
    data = payload.model_dump(exclude_unset=True)
    return expense_service.update_expense(session, expense_id, data)


@router.delete(
    "/{expense_id}",
    status_code=204,
    dependencies=[Depends(deps.require_action(Modules.EXPENSES, Actions.DELETE))],
)
def delete_expense(expense_id: str, session: deps.SessionDep):
    expense_service.delete_expense(session, expense_id)
