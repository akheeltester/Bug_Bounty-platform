from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db                              # FIX
from app.services.leaderboard_service import leaderboard_service  # FIX
from app.dependencies import get_current_user                # FIX

router = APIRouter()


@router.get("")
async def global_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await leaderboard_service.get_leaderboard(db, limit=limit)


@router.get("/me")
async def my_rank(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await leaderboard_service.get_user_rank(db, current_user["_id"])
