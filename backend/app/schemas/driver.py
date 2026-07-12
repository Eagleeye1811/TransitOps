from datetime import date

from pydantic import BaseModel


class DriverRead(BaseModel):
    id: str
    name: str
    licence_number: str
    licence_category: str
    licence_expiry: date
    contact: str | None = None
    region: str
    safety_score: int
    status: str
    current_assignment: str | None = None
    trips_completed: int
    joined_on: date | None = None

    model_config = {"from_attributes": True}


class DriverCreate(BaseModel):
    name: str
    licence_number: str
    licence_category: str
    licence_expiry: date
    contact: str | None = None
    region: str
    joined_on: date | None = None


class DriverUpdate(BaseModel):
    name: str | None = None
    licence_number: str | None = None
    licence_category: str | None = None
    licence_expiry: date | None = None
    contact: str | None = None
    region: str | None = None
    safety_score: int | None = None


class DriverStatusUpdate(BaseModel):
    status: str
