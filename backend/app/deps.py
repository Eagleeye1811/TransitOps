from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.core.permissions import can_access_module, can_perform_action
from app.core.roles import is_valid_role
from app.core.security import TokenError, decode_access_token
from app.db.session import get_session

SessionDep = Annotated[Session, Depends(get_session)]

_bearer = HTTPBearer(auto_error=False)


class CurrentUser:
    """Lightweight claims object decoded straight from the JWT — no DB hit
    per request. See the plan's documented tradeoff: role/status changes by
    an admin don't take effect for an already-issued token until it expires
    (max 12h). Callers that need fresh DB state (e.g. GET /auth/me) query
    the users table explicitly instead of relying on this.
    """

    def __init__(self, user_id: str, role: str, email: str, name: str):
        self.id = user_id
        self.role = role
        self.email = email
        self.name = name


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")
    try:
        payload = decode_access_token(credentials.credentials)
    except TokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    role = payload.get("role")
    if not is_valid_role(role):
        # Unknown/missing role never defaults to elevated access — mirrors
        # the frontend's ProtectedRoute behaviour exactly.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unrecognised role.")

    return CurrentUser(user_id=payload["sub"], role=role, email=payload.get("email", ""), name=payload.get("name", ""))


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


def require_module(module: str):
    """FastAPI dependency factory — server-side analogue of the frontend's
    `canAccessModule` check inside `RequireModule`/`usePermissions`.
    """

    def _check(user: CurrentUserDep) -> CurrentUser:
        if not can_access_module(user.role, module):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have access to this module.")
        return user

    return _check


def require_action(module: str, action: str):
    """FastAPI dependency factory — server-side analogue of `canPerformAction`
    / `PermissionGate`. Use on every mutating route.
    """

    def _check(user: CurrentUserDep) -> CurrentUser:
        if not can_perform_action(user.role, module, action):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have permission to perform this action.")
        return user

    return _check
