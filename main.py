"""
ABD Post Pilot — FastAPI entrypoint.
Wires up CORS, rate limiting, logging, and all routers.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.logging_config import configure_logging, get_logger
from app.core.rate_limit import limiter
from app.routers import auth, instagram_accounts, batches, scheduler, history, dashboard

configure_logging(settings.environment)
logger = get_logger(__name__)

app = FastAPI(
    title="ABD Post Pilot API",
    description="AI-assisted Instagram multi-account auto posting & smart scheduler.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(instagram_accounts.router)
app.include_router(batches.router)
app.include_router(scheduler.router)
app.include_router(history.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}


@app.on_event("startup")
async def on_startup():
    logger.info("ABD Post Pilot API starting in %s mode", settings.environment)
