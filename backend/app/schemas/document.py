from datetime import date, datetime

from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: str
    owner_type: str
    owner_id: str
    doc_type: str
    file_url: str
    document_number: str | None = None
    expiry_date: date | None = None
    uploaded_at: datetime
    uploaded_by: str | None = None

    model_config = {"from_attributes": True}
