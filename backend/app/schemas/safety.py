from datetime import date as _date

from pydantic import BaseModel


class SafetyIncidentRead(BaseModel):
    id: str
    driver_id: str
    vehicle_id: str | None = None
    type: str
    severity: str
    date: _date
    description: str | None = None
    status: str

    model_config = {"from_attributes": True}


class SafetyIncidentCreate(BaseModel):
    driver_id: str
    vehicle_id: str | None = None
    type: str
    severity: str
    date: _date
    description: str | None = None


class SafetyIncidentUpdate(BaseModel):
    driver_id: str | None = None
    vehicle_id: str | None = None
    type: str | None = None
    severity: str | None = None
    # NOTE: must use `_date` (the aliased import), not `date` — a field
    # literally named `date` with a default value binds `date = None` in the
    # class namespace *before* the `date | None` annotation is evaluated,
    # raising `TypeError: unsupported operand type(s) for |: 'NoneType' and
    # 'NoneType'`. See app/schemas/fuel_log.py for the same footgun.
    date: _date | None = None
    description: str | None = None
    status: str | None = None


class SafetyViolationRead(BaseModel):
    id: str
    driver_id: str
    description: str
    raised_on: _date
    status: str

    model_config = {"from_attributes": True}


class SafetyViolationCreate(BaseModel):
    driver_id: str
    description: str
    raised_on: _date


class SafetyViolationUpdate(BaseModel):
    driver_id: str | None = None
    description: str | None = None
    raised_on: _date | None = None
    status: str | None = None


class LicenceUpdate(BaseModel):
    licence_expiry: _date
