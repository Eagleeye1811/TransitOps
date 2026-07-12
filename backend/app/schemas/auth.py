from pydantic import BaseModel

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class LoginResponse(BaseModel):
    token: str
    user: UserRead
