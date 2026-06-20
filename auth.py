"""
Auth router. Actual signup/login happens client-side via Supabase Auth
(it issues the JWT directly to the browser) — this router only exposes
a /me endpoint for the frontend to validate the current session and
fetch the linked profile row.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id
from app.core.supabase_client import get_supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    profile = (
        supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    )
    return profile.data
