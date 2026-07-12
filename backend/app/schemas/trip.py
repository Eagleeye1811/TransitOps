from datetime import date, datetime, time

from pydantic import BaseModel


class TripRead(BaseModel):
    id: str
    source: str
    destination: str
    vehicle_id: str | None = None
    driver_id: str | None = None
    cargo_weight_kg: int
    planned_distance_km: int
    region: str
    scheduled_date: date
    scheduled_time: time
    status: str
    created_at: datetime
    eta_minutes: int | None = None
    dispatched_at: datetime | None = None
    completed_at: datetime | None = None
    cancel_reason: str | None = None
    source_lat: float | None = None
    source_lng: float | None = None
    destination_lat: float | None = None
    destination_lng: float | None = None

    model_config = {"from_attributes": True}


class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: str | None = None
    driver_id: str | None = None
    cargo_weight_kg: int
    planned_distance_km: int
    region: str
    scheduled_date: date
    scheduled_time: time


class TripUpdate(BaseModel):
    source: str | None = None
    destination: str | None = None
    vehicle_id: str | None = None
    driver_id: str | None = None
    cargo_weight_kg: int | None = None
    planned_distance_km: int | None = None
    region: str | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None


class ValidateAssignmentRequest(BaseModel):
    vehicle_id: str | None = None
    driver_id: str | None = None
    cargo_weight_kg: int | None = None
    exclude_trip_id: str | None = None


class ValidationResult(BaseModel):
    is_valid: bool
    errors: list[str]


class CancelTripRequest(BaseModel):
    reason: str | None = None
