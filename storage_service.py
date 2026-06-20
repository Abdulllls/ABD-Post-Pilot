"""
Supabase Storage helpers for batch image uploads. Validates file type/size
before upload — never trust client-supplied content-type alone.
"""
import uuid
from fastapi import UploadFile, HTTPException
from app.core.supabase_client import get_supabase
from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
BUCKET = "batch-images"


async def validate_image(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported image type: {file.content_type}")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(400, f"Image exceeds {settings.max_upload_mb}MB limit")

    return contents


def upload_image(user_id: str, contents: bytes, original_filename: str) -> str:
    """Uploads to Supabase Storage under a per-user prefix, returns storage path."""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    path = f"{user_id}/{uuid.uuid4().hex}.{ext}"

    supabase = get_supabase()
    supabase.storage.from_(BUCKET).upload(path, contents)
    return path


def get_public_url(storage_path: str) -> str:
    supabase = get_supabase()
    return supabase.storage.from_(BUCKET).get_public_url(storage_path)
