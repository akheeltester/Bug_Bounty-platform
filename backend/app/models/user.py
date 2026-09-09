from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRole(str, Enum):
    ADMIN = "admin"
    PARTICIPANT = "participant"


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    role: UserRole = UserRole.PARTICIPANT


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    points: int = 0
    total_earnings: float = 0

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_schema_extra={
            "example": {
                "_id": "60d5ecb8b391681a942b0123",
                "email": "hunter@example.com",
                "username": "shadow_walker",
                "role": "participant",
                "is_active": True,
                "points": 500,
                "total_earnings": 1250.00
            }
        }
    )


class UserInDB(UserBase):
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    points: int = 0
    total_earnings: float = 0
