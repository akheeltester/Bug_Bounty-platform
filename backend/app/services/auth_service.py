"""
services/auth_service.py
BUG FIXES:
  - from models.user → from app.models.user        (absolute imports)
  - from utils.security → from app.utils.security
  - find_one duplicate check: 2nd arg was treated as projection not filter → split into two queries
  - ObjectId(_id) → str conversion when building UserResponse
"""
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.models.user import UserCreate, UserInDB, UserResponse   # FIX: app. prefix
from app.utils.security import get_password_hash, verify_password, create_access_token  # FIX


class AuthService:

    @staticmethod
    async def register_user(db: AsyncIOMotorDatabase, user_in: UserCreate) -> dict:
        # FIX: check email and username in separate queries (second arg to find_one is projection)
        if await db.users.find_one({"email": user_in.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )
        if await db.users.find_one({"username": user_in.username}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken.",
            )

        hashed_pw = get_password_hash(user_in.password)
        user_dict = user_in.model_dump(exclude={"password"})
        user_internal = UserInDB(**user_dict, hashed_password=hashed_pw)

        result = await db.users.insert_one(user_internal.model_dump())
        created_user = await db.users.find_one({"_id": result.inserted_id})

        created_user["_id"] = str(created_user["_id"])
        created_user.pop("hashed_password", None)
        return created_user

    @staticmethod
    async def authenticate_user(
        db: AsyncIOMotorDatabase,
        email: str,
        password: str,
    ) -> Optional[dict]:
        user_data = await db.users.find_one({"email": email})
        if not user_data:
            return None
        if not verify_password(password, user_data["hashed_password"]):
            return None
        user_data["_id"] = str(user_data["_id"])
        user_data.pop("hashed_password", None)
        return user_data

    @staticmethod
    def create_user_token(user: dict) -> str:
        return create_access_token(subject=str(user["_id"]))


auth_service = AuthService()
