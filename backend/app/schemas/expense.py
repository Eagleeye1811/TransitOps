from datetime import date as date_

from pydantic import BaseModel


class ExpenseRead(BaseModel):
    id: str
    vehicle_id: str
    trip_id: str | None = None
    category: str
    amount: float
    date: date_
    description: str | None = None

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    vehicle_id: str
    trip_id: str | None = None
    category: str
    amount: float
    date: date_
    description: str | None = None


class ExpenseUpdate(BaseModel):
    vehicle_id: str | None = None
    trip_id: str | None = None
    category: str | None = None
    amount: float | None = None
    date: date_ | None = None
    description: str | None = None
