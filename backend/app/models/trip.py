from datetime import date, datetime, time

from sqlmodel import Field, SQLModel

from app.models.enums import TripStatus


class Trip(SQLModel, table=True):
    __tablename__ = "trips"

    id: str = Field(primary_key=True)
    source: str
    destination: str
    vehicle_id: str | None = Field(default=None, foreign_key="vehicles.id", index=True)
    driver_id: str | None = Field(default=None, foreign_key="drivers.id", index=True)
    cargo_weight_kg: int
    planned_distance_km: int
    region: str
    scheduled_date: date
    scheduled_time: time
    status: str = Field(default=TripStatus.DRAFT, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    eta_minutes: int | None = None
    dispatched_at: datetime | None = None
    completed_at: datetime | None = None
    cancel_reason: str | None = None

    # Cached Mapbox geocode results for the static route-visualization bonus
    # feature — avoids re-geocoding the same source/destination on every view.
    source_lat: float | None = None
    source_lng: float | None = None
    destination_lat: float | None = None
    destination_lng: float | None = None
