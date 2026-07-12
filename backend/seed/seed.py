"""Idempotent seed entrypoint. Run with:  uv run python -m seed.seed
Safe to re-run — skips seeding if users already exist.
"""

import re
from datetime import date, time

from sqlmodel import Session, SQLModel, func, select

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import metadata  # noqa: F401  (ensures all models are registered)
from app.db.session import engine
from app.models.activity import ActivityLog
from app.models.driver import Driver
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.id_counter import IdCounter
from app.models.maintenance import MaintenanceRecord
from app.models.notification import Notification
from app.models.org_settings import OrgSettings
from app.models.safety import SafetyIncident, SafetyViolation
from app.models.trip import Trip
from app.models.user import User
from app.models.vehicle import Vehicle
from seed.seed_data import (
    DEMO_PASSWORD,
    DRIVERS,
    EXPENSES,
    FUEL_LOGS,
    MAINTENANCE_RECORDS,
    NOTIFICATIONS,
    SAFETY_INCIDENTS,
    SAFETY_VIOLATIONS,
    TRIPS,
    USERS,
    VEHICLES,
)


_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_TIME_RE = re.compile(r"^\d{2}:\d{2}:\d{2}$")


def _coerce_temporal(row: dict) -> dict:
    """seed_data.py stores dates/times as plain ISO strings (matching the
    frontend mock data literally); SQLite's DBAPI (unlike psycopg) requires
    real Python date/time objects, so coerce them here at the seed boundary
    rather than making seed_data.py itself less readable.
    """
    out = {}
    for key, value in row.items():
        if isinstance(value, str) and _DATE_RE.match(value):
            out[key] = date.fromisoformat(value)
        elif isinstance(value, str) and _TIME_RE.match(value):
            out[key] = time.fromisoformat(value)
        else:
            out[key] = value
    return out


def _seed_counters(session: Session, ids_by_prefix: dict[str, list[str]]) -> None:
    for prefix, ids in ids_by_prefix.items():
        highest = max((int(i.split("-")[-1]) for i in ids), default=0)
        session.add(IdCounter(prefix=prefix, next_value=highest + 1))


def _already_seeded(session: Session) -> bool:
    count = session.exec(select(func.count()).select_from(User)).one()
    return count > 0


def seed(session: Session) -> None:
    if _already_seeded(session):
        print("Database already seeded — skipping.")
        return

    password_hash = hash_password(DEMO_PASSWORD)

    # SQLModel/SQLAlchemy only auto-orders flush() inserts across tables when
    # tables are linked via `Relationship()`; this schema uses plain string
    # `foreign_key=` columns with no back-references, so there's nothing for
    # the unit-of-work to sort by. Postgres enforces the FK constraints
    # strictly (unlike SQLite, which silently allows the violation), so each
    # dependency tier below is flushed before the tier that references it.
    for row in USERS:
        session.add(User(password_hash=password_hash, **_coerce_temporal(row)))
    session.flush()

    for row in VEHICLES:
        session.add(Vehicle(**_coerce_temporal(row)))

    for row in DRIVERS:
        session.add(Driver(**_coerce_temporal(row)))
    session.flush()

    for row in TRIPS:
        session.add(Trip(**_coerce_temporal(row)))
    session.flush()

    for row in MAINTENANCE_RECORDS:
        session.add(MaintenanceRecord(**_coerce_temporal(row)))

    for row in FUEL_LOGS:
        session.add(FuelLog(**_coerce_temporal(row)))

    for row in EXPENSES:
        session.add(Expense(**_coerce_temporal(row)))

    for row in SAFETY_INCIDENTS:
        session.add(SafetyIncident(**_coerce_temporal(row)))

    for row in SAFETY_VIOLATIONS:
        session.add(SafetyViolation(**_coerce_temporal(row)))

    for row in NOTIFICATIONS:
        session.add(Notification(**row))

    session.add(OrgSettings(id=1))

    session.add(
        ActivityLog(id="ACT-001", actor_user_id="USR-003", action="dispatched trip TRIP-009 (VAN-08 / Rakesh Singh)")
    )
    session.add(
        ActivityLog(
            id="ACT-002", actor_user_id="USR-004", action="suspended driver John Fernandes after harsh-braking incident"
        )
    )
    session.add(
        ActivityLog(id="ACT-003", actor_user_id="USR-002", action="logged maintenance MNT-003 for MINI-03 (tyre replacement)")
    )

    # id_service.next_id() allocates from a per-prefix counter — since the
    # rows above were inserted with their literal mock IDs (not via
    # next_id()), the counters must be seeded to continue *after* the
    # highest number already used, or the first real POST /vehicles etc.
    # after seeding would collide with e.g. VEH-001.
    _seed_counters(
        session,
        {
            "USR": [row["id"] for row in USERS],
            "VEH": [row["id"] for row in VEHICLES],
            "DRV": [row["id"] for row in DRIVERS],
            "TRIP": [row["id"] for row in TRIPS],
            "MNT": [row["id"] for row in MAINTENANCE_RECORDS],
            "FUEL": [row["id"] for row in FUEL_LOGS],
            "EXP": [row["id"] for row in EXPENSES],
            "INC": [row["id"] for row in SAFETY_INCIDENTS],
            "VIO": [row["id"] for row in SAFETY_VIOLATIONS],
            "NTF": [row["id"] for row in NOTIFICATIONS],
            "ACT": ["ACT-001", "ACT-002", "ACT-003"],
        },
    )

    session.commit()
    print(f"Seeded {len(USERS)} users, {len(VEHICLES)} vehicles, {len(DRIVERS)} drivers, {len(TRIPS)} trips.")
    print(f"Demo login password for every account: {DEMO_PASSWORD}")


if __name__ == "__main__":
    if settings.is_sqlite:
        # Dev convenience — Postgres/Neon schemas are managed by Alembic
        # (`alembic upgrade head`) before this script ever runs.
        SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed(session)
