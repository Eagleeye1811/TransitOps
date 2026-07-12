"""File storage abstraction for the document-management bonus feature.

`store_file`/`delete_file` are the ONLY functions that know where uploaded
files actually live. Right now no Cloudinary account is configured (see
app.core.config.settings), so uploads fall back to base64 data URIs stored
directly in the `documents.file_url` column — fine at prototype scale.

When real Cloudinary credentials are added later, only the internals of
these two functions change — every caller (document_service, the router)
is unaffected.
"""

import base64
import uuid

import cloudinary
import cloudinary.uploader

from app.core.config import settings

_cloudinary_configured = False


def _is_cloudinary_configured() -> bool:
    return bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)


def _ensure_cloudinary_configured() -> None:
    global _cloudinary_configured
    if _cloudinary_configured:
        return
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _cloudinary_configured = True


def store_file(file_bytes: bytes, filename: str, content_type: str) -> tuple[str, str]:
    """Uploads a file and returns (url, public_id).

    Uses Cloudinary when configured; otherwise falls back to a base64 data
    URI stored inline in the database (demo-friendly, zero external signup).
    """
    if _is_cloudinary_configured():
        _ensure_cloudinary_configured()
        result = cloudinary.uploader.upload(file_bytes, filename=filename, resource_type="auto")
        return result["secure_url"], result["public_id"]

    encoded = base64.b64encode(file_bytes).decode()
    data_uri = f"data:{content_type};base64,{encoded}"
    public_id = f"local-{uuid.uuid4().hex}"
    return data_uri, public_id


def delete_file(public_id: str) -> None:
    """Deletes a stored file. No-op for the base64 fallback — that data
    lives in the Document row itself and disappears when the row is deleted.
    """
    if _is_cloudinary_configured() and not public_id.startswith("local-"):
        _ensure_cloudinary_configured()
        cloudinary.uploader.destroy(public_id)
