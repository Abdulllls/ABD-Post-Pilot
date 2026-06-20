"""
Pydantic request/response schemas shared across routers.
Keeping these separate from Supabase table shapes lets the API contract
evolve independently of storage details.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


class PostStatus(str, Enum):
    pending = "pending"
    scheduled = "scheduled"
    publishing = "publishing"
    published = "published"
    failed = "failed"


# ---------- Instagram Accounts ----------

class InstagramAccountCreate(BaseModel):
    ig_user_id: str = Field(..., description="Instagram Business Account ID from Graph API")
    username: str
    access_token: str
    token_expires_at: datetime


class InstagramAccountOut(BaseModel):
    id: str
    ig_user_id: str
    username: str
    token_expires_at: datetime
    is_active: bool
    created_at: datetime


# ---------- Batches ----------

class BatchImageIn(BaseModel):
    storage_path: str
    order_index: int


class BatchCreate(BaseModel):
    instagram_account_id: str
    caption: str = Field(..., max_length=2200)
    hashtags: List[str] = Field(default_factory=list, max_length=30)
    location: str = "Lahore, Punjab, Pakistan"
    images: List[BatchImageIn] = Field(..., min_length=1, max_length=15)
    scheduled_at: Optional[datetime] = None
    interval_minutes: Optional[int] = Field(
        default=None, ge=15, description="If set, posts repeat every N minutes"
    )

    @field_validator("images")
    @classmethod
    def validate_image_count(cls, v):
        if not (1 <= len(v) <= 15):
            raise ValueError("Batch must contain between 1 and 15 images")
        return v


class BatchOut(BaseModel):
    id: str
    instagram_account_id: str
    caption: str
    hashtags: List[str]
    location: str
    status: PostStatus
    scheduled_at: Optional[datetime]
    interval_minutes: Optional[int]
    created_at: datetime


# ---------- Scheduler / Queue ----------

class QueueItemOut(BaseModel):
    id: str
    batch_id: str
    instagram_account_id: str
    status: PostStatus
    scheduled_at: datetime
    attempts: int
    last_error: Optional[str] = None


# ---------- Dashboard ----------

class DashboardStats(BaseModel):
    total_posts: int
    scheduled_posts: int
    published_posts: int
    failed_posts: int
    connected_accounts: int
