from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.enums import NotificationType


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: str = Field(primary_key=True)
    title: str
    message: str
    type: str = Field(default=NotificationType.INFO)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

    # Nullable = broadcast to everyone (matches today's global mock
    # behaviour); set either to target a specific user or an entire role.
    user_id: str | None = Field(default=None, foreign_key="users.id", index=True)
    role: str | None = Field(default=None, index=True)
