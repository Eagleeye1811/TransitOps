from sqlmodel import Field, SQLModel


class OrgSettings(SQLModel, table=True):
    """Singleton row — always id=1."""

    __tablename__ = "org_settings"

    id: int = Field(default=1, primary_key=True)
    organisation_name: str = "TransitOps"
    default_region: str = "Ahmedabad"
    currency: str = "INR"
    distance_unit: str = "Kilometers"
    weight_unit: str = "Kilograms"
    notify_email: bool = True
    notify_sms: bool = False
    notify_licence_expiry: bool = True
    notify_maintenance: bool = True
