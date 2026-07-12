from fastapi import APIRouter
from sqlmodel import select

from app import deps
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: deps.SessionDep):
    token, user = auth_service.login(session, email=payload.email, password=payload.password, role=payload.role)
    return LoginResponse(token=token, user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
def me(current_user: deps.CurrentUserDep, session: deps.SessionDep):
    user = session.exec(select(User).where(User.id == current_user.id)).first()
    if user is None:
        raise NotFoundError("User not found.")
    return UserRead.model_validate(user)
