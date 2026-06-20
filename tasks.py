"""
Background worker tasks: the minute-tick scanner, the per-post publish job,
and a bounded retry policy for transient Graph API failures.
"""
import asyncio
from datetime import datetime, timedelta

from app.worker.celery_app import celery_app
from app.core.supabase_client import get_supabase
from app.core.logging_config import get_logger
from app.services import instagram_service, storage_service

logger = get_logger(__name__)

MAX_ATTEMPTS = 3


@celery_app.task(name="app.worker.tasks.check_scheduled_posts")
def check_scheduled_posts():
    """Runs every minute. Finds due scheduled_posts rows and dispatches publish jobs."""
    supabase = get_supabase()
    now = datetime.utcnow().isoformat()

    due = (
        supabase.table("scheduled_posts")
        .select("*")
        .eq("status", "scheduled")
        .lte("scheduled_at", now)
        .execute()
    )

    for item in due.data:
        publish_post.delay(item["id"])

    logger.info("Scheduler tick: %d due post(s) dispatched", len(due.data))


@celery_app.task(name="app.worker.tasks.publish_post", bind=True, max_retries=MAX_ATTEMPTS)
def publish_post(self, scheduled_post_id: str):
    """Publishes one scheduled post via the official Graph API, with retry/backoff."""
    supabase = get_supabase()

    item_resp = supabase.table("scheduled_posts").select("*").eq("id", scheduled_post_id).single().execute()
    item = item_resp.data

    supabase.table("scheduled_posts").update({"status": "publishing"}).eq("id", scheduled_post_id).execute()

    try:
        result = asyncio.run(_do_publish(item))
        supabase.table("scheduled_posts").update({"status": "published"}).eq("id", scheduled_post_id).execute()
        supabase.table("post_batches").update({"status": "published"}).eq("id", item["batch_id"]).execute()
        supabase.table("published_posts").insert(
            {
                "user_id": item["user_id"],
                "batch_id": item["batch_id"],
                "ig_media_id": result,
                "status": "published",
            }
        ).execute()

        # Recurring interval posting: schedule the next run
        if item.get("interval_minutes"):
            next_run = datetime.utcnow() + timedelta(minutes=item["interval_minutes"])
            supabase.table("scheduled_posts").insert(
                {
                    "user_id": item["user_id"],
                    "batch_id": item["batch_id"],
                    "instagram_account_id": item["instagram_account_id"],
                    "status": "scheduled",
                    "scheduled_at": next_run.isoformat(),
                    "interval_minutes": item["interval_minutes"],
                    "attempts": 0,
                }
            ).execute()

        logger.info("Published scheduled_post %s -> ig_media %s", scheduled_post_id, result)

    except Exception as exc:
        attempts = item.get("attempts", 0) + 1
        logger.error("Publish failed for %s (attempt %d): %s", scheduled_post_id, attempts, exc)

        if attempts >= MAX_ATTEMPTS:
            supabase.table("scheduled_posts").update(
                {"status": "failed", "attempts": attempts, "last_error": str(exc)}
            ).eq("id", scheduled_post_id).execute()
            supabase.table("post_batches").update({"status": "failed"}).eq("id", item["batch_id"]).execute()
        else:
            supabase.table("scheduled_posts").update(
                {"status": "scheduled", "attempts": attempts, "last_error": str(exc)}
            ).eq("id", scheduled_post_id).execute()
            raise self.retry(exc=exc, countdown=60 * attempts)


async def _do_publish(item: dict) -> str:
    """Builds containers for every image in the batch (carousel if >1) and publishes."""
    supabase = get_supabase()

    account = (
        supabase.table("instagram_accounts")
        .select("*")
        .eq("id", item["instagram_account_id"])
        .single()
        .execute()
        .data
    )
    batch = supabase.table("post_batches").select("*").eq("id", item["batch_id"]).single().execute().data
    images = (
        supabase.table("batch_images")
        .select("*")
        .eq("batch_id", item["batch_id"])
        .order("order_index")
        .execute()
        .data
    )

    ig_user_id = account["ig_user_id"]
    access_token = account["access_token"]
    caption = f"{batch['caption']}\n\n{' '.join(batch['hashtags'])}".strip()

    image_urls = [storage_service.get_public_url(img["storage_path"]) for img in images]

    if len(image_urls) == 1:
        container_id = await instagram_service.create_media_container(
            ig_user_id, access_token, image_urls[0], caption
        )
    else:
        child_ids = [
            await instagram_service.create_media_container(ig_user_id, access_token, url, "")
            for url in image_urls
        ]
        container_id = await instagram_service.create_carousel_container(
            ig_user_id, access_token, child_ids, caption
        )

    return await instagram_service.publish_container(ig_user_id, access_token, container_id)
