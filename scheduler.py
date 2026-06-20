"""
Queue management: view pending/scheduled/publishing/failed items, manually
retry a failed post, or cancel a scheduled one before it fires.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user_id
from app.core.supabase_client import get_supabase
from app.services import batch_service

router = APIRouter(prefix="/api/queue", tags=["scheduler"])


@router.get("")
def list_queue(user_id: str = Depends(get_current_user_id)):
    return batch_service.list_queue(user_id)


@router.post("/{queue_item_id}/retry")
def retry_item(queue_item_id: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    item = (
        supabase.table("scheduled_posts")
        .select("*")
        .eq("id", queue_item_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not item.data:
        raise HTTPException(404, "Queue item not found")
    if item.data["status"] != "failed":
        raise HTTPException(400, "Only failed items can be retried")

    supabase.table("scheduled_posts").update(
        {"status": "scheduled", "last_error": None}
    ).eq("id", queue_item_id).execute()
    return {"retried": True}


@router.delete("/{queue_item_id}")
def cancel_item(queue_item_id: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    supabase.table("scheduled_posts").delete().eq("id", queue_item_id).eq(
        "user_id", user_id
    ).execute()
    return {"cancelled": True}
