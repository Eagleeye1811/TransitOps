from datetime import date
from decimal import Decimal

from sqlmodel import Field, SQLModel


class FuelLog(SQLModel, table=True):
    __tablename__ = "fuel_logs"

    id: str = Field(primary_key=True)
    vehicle_id: str = Field(foreign_key="vehicles.id", index=True)
    date: date
    quantity_litres: Decimal = Field(max_digits=8, decimal_places=2)
    cost: Decimal = Field(max_digits=12, decimal_places=2)
    odometer_km: int
    station: str | None = None
    receipt_ref: str | None = None
