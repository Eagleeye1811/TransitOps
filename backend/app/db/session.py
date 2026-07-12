from collections.abc import Generator

from sqlalchemy.pool import QueuePool, StaticPool
from sqlmodel import Session, create_engine

from app.core.config import settings

if settings.is_sqlite:
    # SQLite (local dev without a Neon account): one shared in-process
    # connection so `sqlite:///./dev.db` behaves sanely under FastAPI's
    # threadpool without "database is locked" surprises.
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # Neon Postgres via its pooled ("-pooler") endpoint. QueuePool here is a
    # small app-side pool of long-lived connections *to PgBouncer* — not a
    # second layer of connection multiplexing (Neon's pooler already does
    # that). pool_pre_ping + pool_recycle protect against Neon's autosuspend
    # silently killing idle connections between requests.
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=300,
    )


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
