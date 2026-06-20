"""
Published / attempted post history — read-only view for the Post History page.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id
from app.core.supabase_client import get_supabase

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
def list_history(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    resp = (
        supabase.table("published_posts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data
