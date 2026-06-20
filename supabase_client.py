"""
Single shared Supabase client (service-role) for server-side operations.
The frontend talks to Supabase directly with the anon key under RLS;
the backend uses the service-role key only where it must act on a user's
behalf (e.g. the worker publishing a scheduled post), and always scopes
queries by user_id explicitly to preserve isolation even with RLS bypassed.
"""
from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_key)
    return _client
