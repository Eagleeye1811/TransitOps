from datetime import date

from sqlmodel import Session, select

from app.core.exceptions import NotFoundError
from app.models.document import Document
from app.services import storage_service
from app.services.id_service import next_id


def list_documents(session: Session, *, owner_type: str, owner_id: str) -> list[Document]:
    query = (
        select(Document)
        .where(Document.owner_type == owner_type, Document.owner_id == owner_id)
        .order_by(Document.uploaded_at.desc())
    )
    return list(session.exec(query).all())


def get_document(session: Session, document_id: str) -> Document:
    document = session.get(Document, document_id)
    if document is None:
        raise NotFoundError(f"Document {document_id} not found.")
    return document


def create_document(
    session: Session,
    *,
    owner_type: str,
    owner_id: str,
    doc_type: str,
    file_bytes: bytes,
    filename: str,
    content_type: str,
    document_number: str | None = None,
    expiry_date: date | None = None,
    uploaded_by: str | None = None,
) -> Document:
    file_url, public_id = storage_service.store_file(file_bytes, filename, content_type)

    document_id = next_id(session, "DOC")
    document = Document(
        id=document_id,
        owner_type=owner_type,
        owner_id=owner_id,
        doc_type=doc_type,
        file_url=file_url,
        file_public_id=public_id,
        document_number=document_number,
        expiry_date=expiry_date,
        uploaded_by=uploaded_by,
    )
    session.add(document)
    session.commit()
    session.refresh(document)
    return document


def delete_document(session: Session, document_id: str) -> None:
    document = get_document(session, document_id)
    storage_service.delete_file(document.file_public_id)
    session.delete(document)
    session.commit()
