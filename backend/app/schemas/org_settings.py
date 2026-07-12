from pydantic import BaseModel


class OrgSettingsRead(BaseModel):
    id: int
    organisation_name: str
    default_region: str
    currency: str
    distance_unit: str
    weight_unit: str
    notify_email: bool
    notify_sms: bool
    notify_licence_expiry: bool
    notify_maintenance: bool

    model_config = {"from_attributes": True}


class OrgSettingsUpdate(BaseModel):
    organisation_name: str | None = None
    default_region: str | None = None
    currency: str | None = None
    distance_unit: str | None = None
    weight_unit: str | None = None
    notify_email: bool | None = None
    notify_sms: bool | None = None
    notify_licence_expiry: bool | None = None
    notify_maintenance: bool | None = None
