from typing import List, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException


class LeaderboardService:

    @staticmethod
    async def get_leaderboard(db: AsyncIOMotorDatabase, limit: int = 50) -> List[Dict[str, Any]]:
        cursor = db.users.find(
            {"is_active": True, "role": "participant"},
            {"username": 1, "points": 1, "total_earnings": 1, "_id": 0},
        ).sort("total_earnings", -1).limit(limit)

        users = await cursor.to_list(length=limit)
        return [
            {"rank": i + 1, "username": u["username"], "points": u.get("points", 0), "total_earnings": u.get("total_earnings", 0)}
            for i, u in enumerate(users)
        ]

    @staticmethod
    async def get_user_rank(db: AsyncIOMotorDatabase, user_id: str) -> Dict[str, Any]:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            raise HTTPException(status_code=404, detail="User not found.")
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        user_earnings = user.get("total_earnings", 0)
        higher = await db.users.count_documents(
            {"total_earnings": {"$gt": user_earnings}, "is_active": True, "role": "participant"}
        )
        total = await db.users.count_documents({"is_active": True, "role": "participant"})
        return {
            "rank": higher + 1,
            "total_participants": total,
            "points": user.get("points", 0),
            "total_earnings": user_earnings,
            "username": user["username"],
        }


leaderboard_service = LeaderboardService()
