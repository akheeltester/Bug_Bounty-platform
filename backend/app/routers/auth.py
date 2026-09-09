from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.user import UserCreate, UserLogin
from app.services.auth_service import auth_service
from app.dependencies import get_current_user, rate_limit_auth

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _= Depends(rate_limit_auth),
):
    """Register a new participant."""
    return await auth_service.register_user(db, user_in)


@router.post("/login")
async def login(
    login_data: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_db),
    _= Depends(rate_limit_auth),
):
    """Authenticate and return a JWT access token."""
    user = await auth_service.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.create_user_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "role": user["role"],
        },
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "points": current_user.get("points", 0),
        "total_earnings": current_user.get("total_earnings", 0),
        "is_active": current_user.get("is_active", True),
    }
