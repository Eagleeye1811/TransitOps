from datetime import date
from decimal import Decimal

from sqlmodel import Field, SQLModel

from app.models.enums import MaintenanceStatus


class MaintenanceRecord(SQLModel, table=True):
    __tablename__ = "maintenance_records"

    id: str = Field(primary_key=True)
    vehicle_id: str = Field(foreign_key="vehicles.id", index=True)
    service_type: str
    description: str | None = None
    cost: Decimal = Field(default=0, max_digits=12, decimal_places=2)
    service_date: date
    expected_completion_date: date | None = None
    status: str = Field(default=MaintenanceStatus.SCHEDULED, index=True)
