"""
database.py — MongoDB async connection manager (Motor)
Cyber Olympics Bug Bounty Platform
"""
import logging
import time
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseSingleton:
    """Thread-safe MongoDB connection singleton."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


_db_instance = DatabaseSingleton()


async def connect_db() -> None:
    """Establish async MongoDB connection with retry logic."""
    max_retries = 5
    retry_delay = 3

    for attempt in range(max_retries):
        try:
            _db_instance.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=settings.MONGO_CONNECT_TIMEOUT_MS,
                maxPoolSize=settings.MONGO_MAX_POOL_SIZE,
                minPoolSize=settings.MONGO_MIN_POOL_SIZE,
                uuidRepresentation="standard",
            )
            _db_instance.db = _db_instance.client[settings.MONGO_DB_NAME]
            await _db_instance.client.admin.command("ping")
            logger.info("MongoDB connected successfully.")
            return
        except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
            if attempt < max_retries - 1:
                logger.warning(
                    "MongoDB not ready (attempt %d/%d). Retrying in %ds... [%s]",
                    attempt + 1, max_retries, retry_delay, exc,
                )
                time.sleep(retry_delay)
            else:
                logger.critical(
                    "MongoDB connection failed after %d attempts. "
                    "Ensure MongoDB is running on %s",
                    max_retries, settings.MONGO_URI,
                )
                raise


async def close_db() -> None:
    """Close the MongoDB client connection."""
    if _db_instance.client is not None:
        _db_instance.client.close()
        logger.info("MongoDB connection closed.")


def get_db() -> AsyncIOMotorDatabase:
    """Return the active database instance (FastAPI dependency).

    This is intentionally synchronous — it only returns a reference
    to the already-connected singleton. No I/O occurs here.
    """
    if _db_instance.db is None:
        raise RuntimeError("Database not initialised. Did the lifespan run?")
    return _db_instance.db
