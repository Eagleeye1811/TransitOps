from datetime import datetime

from pydantic import BaseModel


class ActivityRead(BaseModel):
    id: str
    actor_user_id: str
    actor_name: str
    actor_role: str
    action: str
    timestamp: datetime

    model_config = {"from_attributes": True}
