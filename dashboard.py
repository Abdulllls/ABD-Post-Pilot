"""
Aggregate stats for the dashboard cards (total/scheduled/published/failed
posts + connected accounts).
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id
from app.models.schemas import DashboardStats
from app.services import batch_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(user_id: str = Depends(get_current_user_id)):
    return batch_service.dashboard_stats(user_id)
