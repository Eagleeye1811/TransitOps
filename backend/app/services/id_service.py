from sqlmodel import Session

from app.models.id_counter import IdCounter


def next_id(session: Session, prefix: str) -> str:
    """Allocates the next `PREFIX-NNN` id, locking the counter row for the
    duration of the caller's transaction. Must be called inside an existing
    transaction/session — does not commit itself.
    """
    counter = session.get(IdCounter, prefix, with_for_update=True)
    if counter is None:
        counter = IdCounter(prefix=prefix, next_value=1)
        session.add(counter)
        session.flush()

    value = counter.next_value
    counter.next_value = value + 1
    session.add(counter)
    session.flush()

    return f"{prefix}-{value:03d}"
