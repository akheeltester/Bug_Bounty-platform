"""
main.py — FastAPI application entrypoint
Cyber Olympics Bug Bounty Platform
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import close_db, connect_db, get_db

# ── Router imports ────────────────────────────────────────────────────────────
from app.routers import admin, auth, leaderboard, programs, submissions

logger = logging.getLogger(__name__)


async def _bootstrap_admin() -> None:
    """Create the default admin user on first startup if none exists."""
    from app.utils.security import get_password_hash

    db = get_db()

    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        logger.info("Admin user already exists — skipping bootstrap")
        return

    hashed_pw = get_password_hash(settings.ADMIN_PASSWORD)
    admin_doc = {
        "username": settings.ADMIN_USERNAME,
        "email": settings.ADMIN_EMAIL,
        "role": "admin",
        "hashed_password": hashed_pw,
        "is_active": True,
        "points": 0,
    }
    result = await db.users.insert_one(admin_doc)
    logger.info("Bootstrap admin user created (id=%s)", result.inserted_id)


async def _migrate_data() -> None:
    """One-time migration: add reward fields to programs, total_earnings to users."""
    db = get_db()

    # Migrate programs: remove difficulty, add default reward fields
    programs_without_rewards = await db.programs.count_documents({"reward_critical": {"$exists": False}})
    if programs_without_rewards > 0:
        await db.programs.update_many(
            {"reward_critical": {"$exists": False}},
            {"$set": {
                "reward_critical": 1000,
                "reward_high": 500,
                "reward_medium": 250,
                "reward_low": 100,
            }, "$unset": {"difficulty": ""}}
        )
        logger.info(f"Migrated {programs_without_rewards} programs: added rewards, removed difficulty")

    # Migrate users: add total_earnings field
    users_without_earnings = await db.users.count_documents({"total_earnings": {"$exists": False}})
    if users_without_earnings > 0:
        await db.users.update_many(
            {"total_earnings": {"$exists": False}},
            {"$set": {"total_earnings": 0}}
        )
        logger.info(f"Migrated {users_without_earnings} users: added total_earnings field")

    # Migrate submissions: add reward_amount field
    subs_without_reward = await db.submissions.count_documents({"reward_amount": {"$exists": False}})
    if subs_without_reward > 0:
        await db.submissions.update_many(
            {"reward_amount": {"$exists": False}},
            {"$set": {"reward_amount": 0}}
        )
        logger.info(f"Migrated {subs_without_reward} submissions: added reward_amount field")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: connect DB, bootstrap admin, then cleanup."""
    await connect_db()
    await _bootstrap_admin()
    await _migrate_data()
    yield
    await close_db()


app = FastAPI(
    title="Cyber Olympics Bug Bounty Platform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api/v1/auth",        tags=["Auth"])
app.include_router(programs.router,    prefix="/api/v1/programs",    tags=["Programs"])
app.include_router(submissions.router, prefix="/api/v1/submissions", tags=["Submissions"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["Leaderboard"])
app.include_router(admin.router,       prefix="/api/v1/admin",       tags=["Admin"])

# ── Static files ──────────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root() -> dict:
    return {
        "platform": "Cyber Olympics Bug Bounty",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health() -> JSONResponse:
    return JSONResponse(status_code=200, content={"status": "ok"})


# ── Error handlers ────────────────────────────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request, exc):  # type: ignore[no-untyped-def]
    return JSONResponse(status_code=404, content={"detail": "Resource not found."})


@app.exception_handler(500)
async def internal_error_handler(request, exc):  # type: ignore[no-untyped-def]
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )
