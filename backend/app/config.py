"""
config.py — Centralized application settings
Cyber Olympics Bug Bounty Platform

All configuration is read from environment variables (or a .env file).
Never hardcode secrets — every sensitive value lives in the environment.

Usage:
    from app.config import settings
    print(settings.MONGO_URI)
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Pydantic-settings automatically reads values from:
      1. Environment variables (takes priority)
      2. A .env file in the working directory (fallback)

    All fields are type-validated on startup — if a required variable
    is missing or the wrong type, the app crashes immediately with a
    clear error rather than silently misbehaving at runtime.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Environment ───────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "cyber_olympics"
    MONGO_MAX_POOL_SIZE: int = 10
    MONGO_MIN_POOL_SIZE: int = 1
    MONGO_CONNECT_TIMEOUT_MS: int = 5000

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Password hashing ──────────────────────────────────────────────────────
    BCRYPT_ROUNDS: int = 12

    # ── CORS / Trusted Hosts ──────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
    ]

    # ── File uploads ──────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024
    ALLOWED_MIME_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "video/mp4",
    ]
    ALLOWED_EXTENSIONS: List[str] = [
        ".jpg", ".jpeg", ".png", ".mp4",
    ]

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_AUTH_REQUESTS: int = 1200
    RATE_LIMIT_AUTH_WINDOW_SECONDS: int = 60
    RATE_LIMIT_SUBMIT_REQUESTS: int = 50
    RATE_LIMIT_SUBMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_GENERAL_REQUESTS: int = 500
    RATE_LIMIT_GENERAL_WINDOW_SECONDS: int = 60

    # ── Admin ─────────────────────────────────────────────────────────────────
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@cyberolympics.local"
    ADMIN_PASSWORD: str

    # ── Scoring ───────────────────────────────────────────────────────────────
    POINTS_CRITICAL: int = 100
    POINTS_HIGH: int = 70
    POINTS_MEDIUM: int = 40
    POINTS_LOW: int = 10
    FIRST_FINDER_BONUS_CRITICAL: int = 20
    FIRST_FINDER_BONUS_HIGH: int = 15
    FIRST_FINDER_BONUS_MEDIUM: int = 10
    FIRST_FINDER_BONUS_LOW: int = 5

    # ── App metadata ─────────────────────────────────────────────────────────
    APP_NAME: str = "Cyber Olympics Bug Bounty Platform"
    APP_VERSION: str = "1.0.0"

    # ── Helpers ───────────────────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def severity_points_map(self) -> dict:
        return {
            "critical": self.POINTS_CRITICAL,
            "high":     self.POINTS_HIGH,
            "medium":   self.POINTS_MEDIUM,
            "low":      self.POINTS_LOW,
        }

    @property
    def first_finder_bonus_map(self) -> dict:
        return {
            "critical": self.FIRST_FINDER_BONUS_CRITICAL,
            "high":     self.FIRST_FINDER_BONUS_HIGH,
            "medium":   self.FIRST_FINDER_BONUS_MEDIUM,
            "low":      self.FIRST_FINDER_BONUS_LOW,
        }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
