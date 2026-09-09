from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, ConfigDict


class ProgramBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10)
    access_url: HttpUrl
    reward_critical: float = Field(default=0, ge=0)
    reward_high: float = Field(default=0, ge=0)
    reward_medium: float = Field(default=0, ge=0)
    reward_low: float = Field(default=0, ge=0)


class ProgramCreate(ProgramBase):
    flag: Optional[str] = None


class ProgramUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=100)
    description: Optional[str] = Field(None, min_length=10)
    access_url: Optional[HttpUrl] = None
    reward_critical: Optional[float] = Field(None, ge=0)
    reward_high: Optional[float] = Field(None, ge=0)
    reward_medium: Optional[float] = Field(None, ge=0)
    reward_low: Optional[float] = Field(None, ge=0)


class ProgramResponse(ProgramBase):
    id: str = Field(..., alias="_id")
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_schema_extra={
            "example": {
                "_id": "65f123abc456def789012345",
                "title": "Main Web Application",
                "description": "Test the primary web application for vulnerabilities.",
                "access_url": "http://target1.local",
                "reward_critical": 1000,
                "reward_high": 500,
                "reward_medium": 250,
                "reward_low": 100,
                "is_active": True,
                "created_at": "2026-04-09T12:00:00Z"
            }
        }
    )


class ProgramInDB(ProgramBase):
    hashed_flag: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
