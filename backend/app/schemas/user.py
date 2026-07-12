from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    phone: str | None = None
    region: str | None = None
    last_login: datetime | None = None
    created_at: datetime
    avatar_color: str | None = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: str | None = None
    region: str | None = None
    avatar_color: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    region: str | None = None
    avatar_color: str | None = None


class UserStatusUpdate(BaseModel):
    status: str


class UserRoleUpdate(BaseModel):
    role: str
