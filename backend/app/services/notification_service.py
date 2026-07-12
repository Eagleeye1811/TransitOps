from sqlmodel import Session, or_, select

from app.core.exceptions import NotFoundError
from app.models.notification import Notification


def list_notifications_for(session: Session, *, user_id: str, role: str) -> list[Notification]:
    query = select(Notification).where(
        or_(
            (Notification.user_id.is_(None)) & (Notification.role.is_(None)),
            Notification.user_id == user_id,
            Notification.role == role,
        )
    )
    return list(session.exec(query.order_by(Notification.created_at.desc())).all())


def mark_read(session: Session, notification_id: str) -> Notification:
    notification = session.get(Notification, notification_id, with_for_update=True)
    if notification is None:
        raise NotFoundError(f"Notification {notification_id} not found.")
    notification.read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification
