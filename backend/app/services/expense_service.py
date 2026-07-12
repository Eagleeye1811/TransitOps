from datetime import date

from sqlmodel import Session, select

from app.core.exceptions import NotFoundError
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.services.id_service import next_id


def list_fuel_logs(
    session: Session,
    *,
    vehicle_id: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[FuelLog]:
    query = select(FuelLog)
    if vehicle_id:
        query = query.where(FuelLog.vehicle_id == vehicle_id)
    if date_from:
        query = query.where(FuelLog.date >= date_from)
    if date_to:
        query = query.where(FuelLog.date <= date_to)
    return list(session.exec(query.order_by(FuelLog.id)).all())


def create_fuel_log(session: Session, payload: dict) -> FuelLog:
    fuel_log_id = next_id(session, "FUEL")
    fuel_log = FuelLog(id=fuel_log_id, **payload)
    session.add(fuel_log)
    session.commit()
    session.refresh(fuel_log)
    return fuel_log


def update_fuel_log(session: Session, fuel_log_id: str, payload: dict) -> FuelLog:
    fuel_log = session.get(FuelLog, fuel_log_id, with_for_update=True)
    if fuel_log is None:
        raise NotFoundError(f"Fuel log {fuel_log_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(fuel_log, key, value)
    session.add(fuel_log)
    session.commit()
    session.refresh(fuel_log)
    return fuel_log


def delete_fuel_log(session: Session, fuel_log_id: str) -> None:
    fuel_log = session.get(FuelLog, fuel_log_id)
    if fuel_log is None:
        raise NotFoundError(f"Fuel log {fuel_log_id} not found.")
    session.delete(fuel_log)
    session.commit()


def list_expenses(
    session: Session,
    *,
    vehicle_id: str | None = None,
    trip_id: str | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[Expense]:
    query = select(Expense)
    if vehicle_id:
        query = query.where(Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.where(Expense.trip_id == trip_id)
    if category:
        query = query.where(Expense.category == category)
    if date_from:
        query = query.where(Expense.date >= date_from)
    if date_to:
        query = query.where(Expense.date <= date_to)
    return list(session.exec(query.order_by(Expense.id)).all())


def create_expense(session: Session, payload: dict) -> Expense:
    expense_id = next_id(session, "EXP")
    expense = Expense(id=expense_id, **payload)
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


def update_expense(session: Session, expense_id: str, payload: dict) -> Expense:
    expense = session.get(Expense, expense_id, with_for_update=True)
    if expense is None:
        raise NotFoundError(f"Expense {expense_id} not found.")
    for key, value in payload.items():
        if value is not None:
            setattr(expense, key, value)
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


def delete_expense(session: Session, expense_id: str) -> None:
    expense = session.get(Expense, expense_id)
    if expense is None:
        raise NotFoundError(f"Expense {expense_id} not found.")
    session.delete(expense)
    session.commit()
