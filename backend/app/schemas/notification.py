from datetime import datetime

from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: str
    title: str
    message: str
    type: str
    created_at: datetime
    read: bool
    user_id: str | None = None
    role: str | None = None

    model_config = {"from_attributes": True}
