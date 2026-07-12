from datetime import datetime

from sqlmodel import Session, select

from app.core.exceptions import DomainError
from app.core.roles import is_valid_role
from app.core.security import create_access_token, verify_password
from app.models.enums import UserStatus
from app.models.user import User


class LoginError(DomainError):
    status_code = 401


def login(session: Session, *, email: str, password: str, role: str) -> tuple[str, User]:
    """Replicates frontend/src/services/authService.js `login()` exactly —
    same validation order, same error strings — so the frontend's error
    handling needs no changes when swapped from mock to real API.
    """
    if not is_valid_role(role):
        err = LoginError("Select a valid role to continue.")
        err.status_code = 400  # malformed request, not a failed credential check
        raise err

    user = session.exec(select(User).where(User.email == email.strip().lower())).first()
    if user is None or not verify_password(password, user.password_hash):
        raise LoginError("Invalid credentials. Please check your email and password.")

    if user.status != UserStatus.ACTIVE:
        message = (
            "This account is locked after too many failed attempts. Contact your administrator."
            if user.status == UserStatus.LOCKED
            else "This account has been deactivated. Contact your administrator."
        )
        err = LoginError(message)
        err.status_code = 403
        raise err

    if user.role != role:
        err = LoginError("The selected role does not match the role assigned to this account.")
        err.status_code = 403
        raise err

    user.last_login = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user_id=user.id, role=user.role, email=user.email, name=user.name)
    return token, user
