from fastapi import APIRouter

from app import deps
from app.schemas.notification import NotificationRead
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def list_notifications(session: deps.SessionDep, user: deps.CurrentUserDep):
    return notification_service.list_notifications_for(session, user_id=user.id, role=user.role)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(notification_id: str, session: deps.SessionDep, user: deps.CurrentUserDep):
    return notification_service.mark_read(session, notification_id)
