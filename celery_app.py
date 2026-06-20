"""
Celery app instance + beat schedule. The 'check-scheduled-posts' task runs
every minute (per the spec: "check database every minute") and dispatches
publish jobs for anything whose scheduled_at has arrived.
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "abd_post_pilot",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Karachi",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "check-scheduled-posts-every-minute": {
        "task": "app.worker.tasks.check_scheduled_posts",
        "schedule": crontab(minute="*"),
    }
}
