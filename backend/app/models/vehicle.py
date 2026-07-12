from datetime import date
from decimal import Decimal

from sqlmodel import Field, SQLModel

from app.models.enums import VehicleStatus


class Vehicle(SQLModel, table=True):
    __tablename__ = "vehicles"

    id: str = Field(primary_key=True)
    registration: str = Field(unique=True, index=True)
    model: str
    type: str
    capacity_kg: int
    odometer_km: int = 0
    region: str
    acquisition_cost: Decimal = Field(default=0, max_digits=12, decimal_places=2)
    status: str = Field(default=VehicleStatus.AVAILABLE, index=True)
    utilisation: int = 0
    operational_cost_monthly: Decimal = Field(default=0, max_digits=12, decimal_places=2)
    roi: Decimal = Field(default=0, max_digits=6, decimal_places=2)
    purchased_on: date | None = None
