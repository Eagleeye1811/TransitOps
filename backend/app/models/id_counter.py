from sqlmodel import Field, SQLModel


class IdCounter(SQLModel, table=True):
    """Backs `id_service.next_id()` — one row per ID prefix (VEH, DRV, TRIP, ...).

    A dedicated counter table (locked per-row inside the caller's transaction)
    is used instead of a raw Postgres SEQUENCE so the same code path works
    identically on SQLite (local dev, no Neon account needed) and Postgres.
    """

    __tablename__ = "id_counters"

    prefix: str = Field(primary_key=True)
    next_value: int = Field(default=1)
