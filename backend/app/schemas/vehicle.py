from datetime import date

from pydantic import BaseModel


class VehicleRead(BaseModel):
    id: str
    registration: str
    model: str
    type: str
    capacity_kg: int
    odometer_km: int
    region: str
    acquisition_cost: float
    status: str
    utilisation: int
    operational_cost_monthly: float
    roi: float
    purchased_on: date | None = None

    model_config = {"from_attributes": True}


class VehicleCreate(BaseModel):
    registration: str
    model: str
    type: str
    capacity_kg: int
    region: str
    acquisition_cost: float = 0
    odometer_km: int = 0
    purchased_on: date | None = None


class VehicleUpdate(BaseModel):
    registration: str | None = None
    model: str | None = None
    type: str | None = None
    capacity_kg: int | None = None
    odometer_km: int | None = None
    region: str | None = None
    acquisition_cost: float | None = None
    status: str | None = None
    utilisation: int | None = None
    operational_cost_monthly: float | None = None
    roi: float | None = None
