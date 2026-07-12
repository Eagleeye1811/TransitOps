from sqlmodel import Session, func, select

from app.core.exceptions import DomainError, NotFoundError
from app.core.roles import is_valid_role
from app.core.security import hash_password
from app.models.enums import UserStatus
from app.models.user import User
from app.services.id_service import next_id

VALID_STATUSES = {UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.LOCKED}


def list_users(
    session: Session,
    *,
    role: str | None = None,
    status: str | None = None,
    search: str | None = None,
) -> list[User]:
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if status:
        query = query.where(User.status == status)
    if search:
        like = f"%{search.lower()}%"
        query = query.where(func.lower(User.name).like(like) | func.lower(User.email).like(like))
    return list(session.exec(query.order_by(User.id)).all())


def get_user(session: Session, user_id: str) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise NotFoundError(f"User {user_id} not found.")
    return user


def is_email_taken(session: Session, email: str, exclude_id: str | None = None) -> bool:
    query = select(User).where(func.lower(User.email) == email.lower())
    if exclude_id:
        query = query.where(User.id != exclude_id)
    return session.exec(query).first() is not None


def create_user(session: Session, payload: dict) -> User:
    payload = dict(payload)
    email = payload.get("email", "")
    if is_email_taken(session, email):
        raise DomainError(f"Email {email} is already in use.")

    plain_password = payload.pop("password")
    password_hash = hash_password(plain_password)

    role = payload.get("role")
    if not is_valid_role(role):
        raise DomainError(f"Invalid role: {role}")

    user_id = next_id(session, "USR")
    user = User(id=user_id, password_hash=password_hash, status=UserStatus.ACTIVE, **payload)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user_id: str, payload: dict) -> User:
    user = session.get(User, user_id, with_for_update=True)
    if user is None:
        raise NotFoundError(f"User {user_id} not found.")

    if "email" in payload and payload["email"] is not None:
        if is_email_taken(session, payload["email"], exclude_id=user_id):
            raise DomainError(f"Email {payload['email']} is already in use.")

    for key, value in payload.items():
        if value is not None:
            setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def set_user_status(session: Session, user_id: str, status: str) -> User:
    if status not in VALID_STATUSES:
        raise DomainError(f"Invalid status: {status}")
    return update_user(session, user_id, {"status": status})


def assign_role(session: Session, user_id: str, role: str) -> User:
    if not is_valid_role(role):
        raise DomainError(f"Invalid role: {role}")
    return update_user(session, user_id, {"role": role})


def reset_account(session: Session, user_id: str) -> User:
    return update_user(session, user_id, {"status": UserStatus.ACTIVE})
