from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.enums import UserStatus


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str = Field(index=True)
    status: str = Field(default=UserStatus.ACTIVE)
    phone: str | None = None
    region: str | None = None
    last_login: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    avatar_color: str | None = None
