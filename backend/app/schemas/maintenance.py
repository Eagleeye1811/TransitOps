from datetime import date

from pydantic import BaseModel


class MaintenanceRead(BaseModel):
    id: str
    vehicle_id: str
    service_type: str
    description: str | None = None
    cost: float
    service_date: date
    expected_completion_date: date | None = None
    status: str

    model_config = {"from_attributes": True}


class MaintenanceCreate(BaseModel):
    vehicle_id: str
    service_type: str
    description: str | None = None
    cost: float = 0
    service_date: date
    expected_completion_date: date | None = None


class MaintenanceUpdate(BaseModel):
    service_type: str | None = None
    description: str | None = None
    cost: float | None = None
    service_date: date | None = None
    expected_completion_date: date | None = None
