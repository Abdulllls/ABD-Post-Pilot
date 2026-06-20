"""
Manage connected Instagram Business accounts. Tokens are validated against
the real Graph API before being stored, and never returned to the client
in plaintext after creation.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user_id
from app.core.supabase_client import get_supabase
from app.models.schemas import InstagramAccountCreate
from app.services.instagram_service import verify_token_and_account, InstagramAPIError

router = APIRouter(prefix="/api/instagram-accounts", tags=["instagram-accounts"])


@router.get("")
def list_accounts(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    resp = (
        supabase.table("instagram_accounts")
        .select("id, ig_user_id, username, token_expires_at, is_active, created_at")
        .eq("user_id", user_id)
        .execute()
    )
    return resp.data


@router.post("")
async def connect_account(
    payload: InstagramAccountCreate, user_id: str = Depends(get_current_user_id)
):
    try:
        await verify_token_and_account(payload.ig_user_id, payload.access_token)
    except InstagramAPIError as exc:
        raise HTTPException(400, f"Could not verify Instagram account: {exc}")

    supabase = get_supabase()
    row = {
        "user_id": user_id,
        "ig_user_id": payload.ig_user_id,
        "username": payload.username,
        "access_token": payload.access_token,  # stored encrypted at rest by Supabase/Postgres
        "token_expires_at": payload.token_expires_at.isoformat(),
        "is_active": True,
    }
    resp = supabase.table("instagram_accounts").insert(row).execute()
    return resp.data[0]


@router.delete("/{account_id}")
def remove_account(account_id: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    supabase.table("instagram_accounts").delete().eq("id", account_id).eq(
        "user_id", user_id
    ).execute()
    return {"deleted": True}


@router.patch("/{account_id}/toggle")
def toggle_account(account_id: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    current = (
        supabase.table("instagram_accounts")
        .select("is_active")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    new_state = not current.data["is_active"]
    supabase.table("instagram_accounts").update({"is_active": new_state}).eq(
        "id", account_id
    ).execute()
    return {"is_active": new_state}
