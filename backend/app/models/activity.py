from datetime import datetime

from sqlmodel import Field, SQLModel


class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_log"

    id: str = Field(primary_key=True)
    actor_user_id: str = Field(foreign_key="users.id", index=True)
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
