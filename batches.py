"""
Create and list post batches (5-15 images, caption, hashtags, location,
schedule). Images are uploaded separately to /api/batches/upload first
so the frontend can show upload progress per file.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from app.core.security import get_current_user_id
from app.models.schemas import BatchCreate, BatchOut
from app.services import batch_service, storage_service

router = APIRouter(prefix="/api/batches", tags=["batches"])


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)
):
    contents = await storage_service.validate_image(file)
    storage_path = storage_service.upload_image(user_id, contents, file.filename)
    return {"storage_path": storage_path, "public_url": storage_service.get_public_url(storage_path)}


@router.post("", response_model=None)
def create_batch(batch: BatchCreate, user_id: str = Depends(get_current_user_id)):
    return batch_service.create_batch(user_id, batch)


@router.get("")
def list_batches(user_id: str = Depends(get_current_user_id)):
    return batch_service.list_batches(user_id)
