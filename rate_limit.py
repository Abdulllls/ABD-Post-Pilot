"""
Simple IP-based rate limiting via slowapi (wraps Redis-backed counters).
Protects auth + publish-triggering endpoints from abuse.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address, storage_uri=settings.redis_url)
