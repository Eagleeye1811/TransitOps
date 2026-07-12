from fastapi import APIRouter

from app import deps
from app.schemas.activity import ActivityRead
from app.services import activity_service

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[ActivityRead])
def list_activity(session: deps.SessionDep, user: deps.CurrentUserDep, limit: int = 50):
    return activity_service.list_activity(session, limit=limit)
