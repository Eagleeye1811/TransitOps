from datetime import date
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Expense(SQLModel, table=True):
    __tablename__ = "expenses"

    id: str = Field(primary_key=True)
    vehicle_id: str = Field(foreign_key="vehicles.id", index=True)
    trip_id: str | None = Field(default=None, foreign_key="trips.id")
    category: str
    amount: Decimal = Field(max_digits=12, decimal_places=2)
    date: date
    description: str | None = None
