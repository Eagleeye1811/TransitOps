from datetime import date, datetime

from sqlmodel import Field, SQLModel


class Document(SQLModel, table=True):
    """Uploaded vehicle/driver documents (RC, insurance, permit, licence
    photos, fuel receipts) — bonus "document management" feature. The file
    itself lives in Cloudinary; this row is the metadata + expiry record.
    """

    __tablename__ = "documents"

    id: str = Field(primary_key=True)
    owner_type: str = Field(index=True)  # "vehicle" | "driver"
    owner_id: str = Field(index=True)
    doc_type: str  # e.g. "RC", "Insurance", "Permit", "Licence", "Fuel Receipt"
    file_url: str  # Cloudinary secure_url
    file_public_id: str  # Cloudinary public_id, for deletion
    document_number: str | None = None
    expiry_date: date | None = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: str | None = Field(default=None, foreign_key="users.id")
