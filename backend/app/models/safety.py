from datetime import date

from sqlmodel import Field, SQLModel

from app.models.enums import IncidentSeverity


class SafetyIncident(SQLModel, table=True):
    __tablename__ = "safety_incidents"

    id: str = Field(primary_key=True)
    driver_id: str = Field(foreign_key="drivers.id", index=True)
    vehicle_id: str | None = Field(default=None, foreign_key="vehicles.id")
    type: str
    severity: str = Field(default=IncidentSeverity.LOW)
    date: date
    description: str | None = None
    status: str = Field(default="under_review")


class SafetyViolation(SQLModel, table=True):
    __tablename__ = "safety_violations"

    id: str = Field(primary_key=True)
    driver_id: str = Field(foreign_key="drivers.id", index=True)
    description: str
    raised_on: date
    status: str = Field(default="open")
