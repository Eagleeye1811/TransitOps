from datetime import date as _date

from pydantic import BaseModel


class FuelLogRead(BaseModel):
    id: str
    vehicle_id: str
    date: _date
    quantity_litres: float
    cost: float
    odometer_km: int
    station: str | None = None
    receipt_ref: str | None = None

    model_config = {"from_attributes": True}


class FuelLogCreate(BaseModel):
    vehicle_id: str
    date: _date
    quantity_litres: float
    cost: float
    odometer_km: int
    station: str | None = None
    receipt_ref: str | None = None


class FuelLogUpdate(BaseModel):
    vehicle_id: str | None = None
    # NOTE: the annotation must use `_date` (the aliased import), not `date` —
    # `date: date | None = None` breaks at class-body eval time. CPython
    # evaluates the RHS `= None` and binds it to the local name `date` in the
    # class namespace *before* evaluating the `date | None` annotation, so
    # `date` in the annotation resolves to the just-bound `None` instead of
    # the imported class, raising `TypeError: unsupported operand type(s)
    # for |: 'NoneType' and 'NoneType'`. Only bites when field name == type
    # name AND a default value is present.
    date: _date | None = None
    quantity_litres: float | None = None
    cost: float | None = None
    odometer_km: int | None = None
    station: str | None = None
    receipt_ref: str | None = None
