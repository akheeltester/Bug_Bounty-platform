"""
dependencies.py — FastAPI dependency injection: auth guards + rate limiter
Cyber Olympics Bug Bounty Platform
"""
import time
import threading
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.config import settings
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# In-memory rate limit store  {key: [timestamp, ...]}
_rate_limit_store: dict[str, list[float]] = {}
_lock = threading.Lock()

# Periodic cleanup every 60s to prevent memory leak
_last_cleanup = time.time()
_CLEANUP_INTERVAL = 60


def _cleanup_old_entries():
    """Remove expired entries from the rate limit store."""
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup < _CLEANUP_INTERVAL:
        return
    _last_cleanup = now
    keys_to_delete = []
    for key, timestamps in _rate_limit_store.items():
        valid = [t for t in timestamps if now - t < 300]  # 5 min max window
        if not valid:
            keys_to_delete.append(key)
        else:
            _rate_limit_store[key] = valid
    for key in keys_to_delete:
        del _rate_limit_store[key]


def _check_rate_limit(key: str, limit: int, window: int) -> None:
    """Core rate-limit logic (sync, thread-safe)."""
    _cleanup_old_entries()
    now = time.time()
    with _lock:
        timestamps = _rate_limit_store.get(key, [])
        timestamps = [t for t in timestamps if now - t < window]
        _rate_limit_store[key] = timestamps

        if len(timestamps) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {limit} requests per {window}s.",
            )
        timestamps.append(now)


def _get_rate_limit_key(request: Request, user_id: str | None = None) -> str:
    """Return rate limit key: user_id for authed, IP for anonymous."""
    if user_id:
        return f"user:{user_id}"
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    return f"ip:{ip}"


def _extract_user_id_from_token(request: Request) -> str | None:
    """Try to extract user ID from Authorization header without validating."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except JWTError:
        return None


async def rate_limit_auth(request: Request) -> None:
    """Rate limiter for auth endpoints (login/register) — per-IP with generous limits."""
    _check_rate_limit(
        _get_rate_limit_key(request),
        limit=settings.RATE_LIMIT_AUTH_REQUESTS,
        window=settings.RATE_LIMIT_AUTH_WINDOW_SECONDS,
    )


async def rate_limit_submit(request: Request) -> None:
    """Rate limiter for submission endpoint — per-user if authenticated."""
    user_id = _extract_user_id_from_token(request)
    _check_rate_limit(
        _get_rate_limit_key(request, user_id),
        limit=settings.RATE_LIMIT_SUBMIT_REQUESTS,
        window=settings.RATE_LIMIT_SUBMIT_WINDOW_SECONDS,
    )


async def rate_limit_general(request: Request) -> None:
    """General rate limiter — per-user if authenticated, per-IP otherwise."""
    user_id = _extract_user_id_from_token(request)
    _check_rate_limit(
        _get_rate_limit_key(request, user_id),
        limit=settings.RATE_LIMIT_GENERAL_REQUESTS,
        window=settings.RATE_LIMIT_GENERAL_WINDOW_SECONDS,
    )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict[str, Any]:
    """Validate JWT and return the current user document."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    user["_id"] = str(user["_id"])
    return user


async def get_current_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Ensure the current user has admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )
    return current_user
