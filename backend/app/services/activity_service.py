from sqlmodel import Session, select

from app.models.activity import ActivityLog
from app.models.user import User
from app.services.id_service import next_id


def list_activity(session: Session, *, limit: int = 50) -> list[dict]:
    query = (
        select(ActivityLog, User)
        .join(User, ActivityLog.actor_user_id == User.id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(limit)
    )
    rows = session.exec(query).all()
    return [
        {
            "id": log.id,
            "actor_user_id": log.actor_user_id,
            "actor_name": user.name,
            "actor_role": user.role,
            "action": log.action,
            "timestamp": log.timestamp,
        }
        for log, user in rows
    ]


def record_activity(session: Session, *, actor_user_id: str, action: str) -> ActivityLog:
    """Reusable helper for other modules (trips, drivers, maintenance, ...)
    to log an activity entry. Not yet wired into those services — callers
    just need to import this function and invoke it inside their own
    create/update flows.
    """
    activity_id = next_id(session, "ACT")
    log = ActivityLog(id=activity_id, actor_user_id=actor_user_id, action=action)
    session.add(log)
    session.commit()
    session.refresh(log)
    return log
