"""
Business logic for creating and reading post batches. Routers stay thin;
this is where validation + Supabase table writes for batches/images/queue
items actually happen.
"""
from datetime import datetime, timedelta
from app.core.supabase_client import get_supabase
from app.core.logging_config import get_logger
from app.models.schemas import BatchCreate, PostStatus

logger = get_logger(__name__)


def create_batch(user_id: str, batch: BatchCreate) -> dict:
    supabase = get_supabase()

    batch_row = {
        "user_id": user_id,
        "instagram_account_id": batch.instagram_account_id,
        "caption": batch.caption,
        "hashtags": batch.hashtags,
        "location": batch.location,
        "status": PostStatus.scheduled if batch.scheduled_at else PostStatus.pending,
        "scheduled_at": batch.scheduled_at.isoformat() if batch.scheduled_at else None,
        "interval_minutes": batch.interval_minutes,
    }
    batch_resp = supabase.table("post_batches").insert(batch_row).execute()
    batch_id = batch_resp.data[0]["id"]

    image_rows = [
        {
            "batch_id": batch_id,
            "storage_path": img.storage_path,
            "order_index": img.order_index,
        }
        for img in batch.images
    ]
    supabase.table("batch_images").insert(image_rows).execute()

    _enqueue_schedule(user_id, batch_id, batch)

    logger.info("Batch %s created for user %s (%d images)", batch_id, user_id, len(batch.images))
    return batch_resp.data[0]


def _enqueue_schedule(user_id: str, batch_id: str, batch: BatchCreate) -> None:
    """Creates scheduled_posts rows. If interval_minutes is set, this single
    batch represents a recurring slot the worker re-checks; otherwise it's
    a one-off scheduled post."""
    supabase = get_supabase()

    run_at = batch.scheduled_at or datetime.utcnow()
    supabase.table("scheduled_posts").insert(
        {
            "user_id": user_id,
            "batch_id": batch_id,
            "instagram_account_id": batch.instagram_account_id,
            "status": PostStatus.scheduled,
            "scheduled_at": run_at.isoformat(),
            "interval_minutes": batch.interval_minutes,
            "attempts": 0,
        }
    ).execute()


def list_batches(user_id: str) -> list[dict]:
    supabase = get_supabase()
    resp = (
        supabase.table("post_batches")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data


def list_queue(user_id: str) -> list[dict]:
    supabase = get_supabase()
    resp = (
        supabase.table("scheduled_posts")
        .select("*")
        .eq("user_id", user_id)
        .order("scheduled_at", desc=False)
        .execute()
    )
    return resp.data


def dashboard_stats(user_id: str) -> dict:
    supabase = get_supabase()

    batches = supabase.table("post_batches").select("status").eq("user_id", user_id).execute().data
    accounts = (
        supabase.table("instagram_accounts")
        .select("id")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
        .data
    )

    total = len(batches)
    scheduled = sum(1 for b in batches if b["status"] in ("scheduled", "pending"))
    published = sum(1 for b in batches if b["status"] == "published")
    failed = sum(1 for b in batches if b["status"] == "failed")

    return {
        "total_posts": total,
        "scheduled_posts": scheduled,
        "published_posts": published,
        "failed_posts": failed,
        "connected_accounts": len(accounts),
    }
