"""
Centralized app configuration. Loaded once from environment variables (.env).
Never hardcode secrets here — this file only defines the *shape* of config.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_anon_key: str
    database_url: str

    # Auth
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Instagram Graph API
    instagram_api_key: str = ""
    instagram_app_secret: str = ""
    instagram_redirect_uri: str = ""
    instagram_graph_version: str = "v19.0"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # App
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"
    max_upload_mb: int = 15

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
