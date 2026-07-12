from datetime import date

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app import deps
from app.core.exceptions import DomainError
from app.core.permissions import Actions, Modules, can_access_module, can_perform_action
from app.schemas.document import DocumentRead
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["documents"])

# There's no dedicated Modules.DOCUMENTS — a vehicle document is gated the
# same as editing that vehicle would be, and a driver document the same as
# editing that driver. Query-param-dependent gating can't be expressed as a
# route `dependencies=[...]`, so each handler checks this map itself first.
_OWNER_MODULES = {
    "vehicle": Modules.FLEET,
    "driver": Modules.DRIVERS,
}


def _require_view(user: deps.CurrentUser, owner_type: str) -> None:
    module = _OWNER_MODULES.get(owner_type)
    if module is None:
        raise DomainError(f"Unknown owner_type '{owner_type}'.")
    if not can_access_module(user.role, module):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have access to this module.")


def _require_edit(user: deps.CurrentUser, owner_type: str) -> None:
    module = _OWNER_MODULES.get(owner_type)
    if module is None:
        raise DomainError(f"Unknown owner_type '{owner_type}'.")

    if owner_type == "driver":
        allowed = can_perform_action(user.role, module, Actions.EDIT) or can_perform_action(
            user.role, module, Actions.EDIT_OPERATIONAL
        )
    else:
        allowed = can_perform_action(user.role, module, Actions.EDIT)

    if not allowed:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have permission to manage documents for this record.")


@router.get("", response_model=list[DocumentRead])
def list_documents(owner_type: str, owner_id: str, session: deps.SessionDep, user: deps.CurrentUserDep):
    _require_view(user, owner_type)
    return document_service.list_documents(session, owner_type=owner_type, owner_id=owner_id)


@router.post("", response_model=DocumentRead)
async def create_document(
    session: deps.SessionDep,
    user: deps.CurrentUserDep,
    owner_type: str = Form(...),
    owner_id: str = Form(...),
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    document_number: str | None = Form(None),
    expiry_date: str | None = Form(None),
):
    _require_edit(user, owner_type)

    parsed_expiry: date | None = None
    if expiry_date:
        try:
            parsed_expiry = date.fromisoformat(expiry_date)
        except ValueError as exc:
            raise DomainError("expiry_date must be in YYYY-MM-DD format.") from exc

    file_bytes = await file.read()
    return document_service.create_document(
        session,
        owner_type=owner_type,
        owner_id=owner_id,
        doc_type=doc_type,
        file_bytes=file_bytes,
        filename=file.filename or "upload",
        content_type=file.content_type or "application/octet-stream",
        document_number=document_number or None,
        expiry_date=parsed_expiry,
        uploaded_by=user.id,
    )


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: str, session: deps.SessionDep, user: deps.CurrentUserDep):
    document = document_service.get_document(session, document_id)
    _require_edit(user, document.owner_type)
    document_service.delete_document(session, document_id)
