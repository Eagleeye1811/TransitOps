from datetime import date

from sqlmodel import Field, SQLModel

from app.models.enums import DriverStatus


class Driver(SQLModel, table=True):
    __tablename__ = "drivers"

    id: str = Field(primary_key=True)
    name: str
    licence_number: str = Field(unique=True, index=True)
    licence_category: str
    licence_expiry: date
    contact: str | None = None
    region: str
    safety_score: int = 100
    status: str = Field(default=DriverStatus.AVAILABLE, index=True)
    # Not a hard FK: avoids a circular drivers<->trips FK dependency, and a
    # trip completing/cancelling clears this via the same service call that
    # updates trip status, so referential drift is a non-issue in practice.
    current_assignment: str | None = None
    trips_completed: int = 0
    joined_on: date | None = None
