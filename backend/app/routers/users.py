from fastapi import APIRouter, Depends

from app import deps
from app.core.permissions import Modules
from app.schemas.user import UserCreate, UserRead, UserRoleUpdate, UserStatusUpdate, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(deps.require_module(Modules.USERS))])


@router.get("", response_model=list[UserRead])
def list_users(
    session: deps.SessionDep,
    role: str | None = None,
    status: str | None = None,
    search: str | None = None,
):
    return user_service.list_users(session, role=role, status=status, search=search)


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: str, session: deps.SessionDep):
    return user_service.get_user(session, user_id)


@router.post("", response_model=UserRead)
def create_user(payload: UserCreate, session: deps.SessionDep):
    return user_service.create_user(session, payload.model_dump())


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: str, payload: UserUpdate, session: deps.SessionDep):
    return user_service.update_user(session, user_id, payload.model_dump(exclude_unset=True))


@router.patch("/{user_id}/status", response_model=UserRead)
def set_user_status(user_id: str, payload: UserStatusUpdate, session: deps.SessionDep):
    return user_service.set_user_status(session, user_id, payload.status)


@router.patch("/{user_id}/role", response_model=UserRead)
def assign_role(user_id: str, payload: UserRoleUpdate, session: deps.SessionDep):
    return user_service.assign_role(session, user_id, payload.role)


@router.post("/{user_id}/reset", response_model=UserRead)
def reset_account(user_id: str, session: deps.SessionDep):
    return user_service.reset_account(session, user_id)
