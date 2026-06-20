"""
Wraps the OFFICIAL Instagram Graph API (Meta). No scraping, no unofficial
endpoints, no third-party automation tricks — only documented endpoints
that require a Meta-reviewed app + the account owner's explicit OAuth
consent. This keeps the platform compliant with Meta's Platform Terms.

Publishing a feed photo is a 2-step Graph API flow:
  1. POST /{ig_user_id}/media        -> create a media container
  2. POST /{ig_user_id}/media_publish -> publish that container
For multi-image batches, each image still publishes as its own container
unless using the carousel container type (children).
"""
import httpx
from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

GRAPH_BASE = f"https://graph.facebook.com/{settings.instagram_graph_version}"


class InstagramAPIError(Exception):
    pass


async def create_media_container(
    ig_user_id: str,
    access_token: str,
    image_url: str,
    caption: str,
) -> str:
    """Step 1: create a media container for a single image. Returns container id."""
    url = f"{GRAPH_BASE}/{ig_user_id}/media"
    payload = {"image_url": image_url, "caption": caption, "access_token": access_token}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=payload)

    if resp.status_code != 200:
        logger.error("IG create_media_container failed: %s", resp.text)
        raise InstagramAPIError(resp.text)

    return resp.json()["id"]


async def create_carousel_container(
    ig_user_id: str,
    access_token: str,
    child_container_ids: list[str],
    caption: str,
    location_id: str | None = None,
) -> str:
    """Create a carousel (multi-image) container referencing child containers."""
    url = f"{GRAPH_BASE}/{ig_user_id}/media"
    payload = {
        "media_type": "CAROUSEL",
        "children": ",".join(child_container_ids),
        "caption": caption,
        "access_token": access_token,
    }
    if location_id:
        payload["location_id"] = location_id

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=payload)

    if resp.status_code != 200:
        logger.error("IG create_carousel_container failed: %s", resp.text)
        raise InstagramAPIError(resp.text)

    return resp.json()["id"]


async def publish_container(ig_user_id: str, access_token: str, creation_id: str) -> str:
    """Step 2: publish a created container. Returns the published media id."""
    url = f"{GRAPH_BASE}/{ig_user_id}/media_publish"
    payload = {"creation_id": creation_id, "access_token": access_token}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=payload)

    if resp.status_code != 200:
        logger.error("IG publish_container failed: %s", resp.text)
        raise InstagramAPIError(resp.text)

    return resp.json()["id"]


async def verify_token_and_account(ig_user_id: str, access_token: str) -> dict:
    """Sanity-check a connected account's token before storing/scheduling with it."""
    url = f"{GRAPH_BASE}/{ig_user_id}"
    params = {"fields": "id,username", "access_token": access_token}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)

    if resp.status_code != 200:
        raise InstagramAPIError(resp.text)

    return resp.json()
