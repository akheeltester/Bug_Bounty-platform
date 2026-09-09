from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class VulnerabilityType(str, Enum):
    SQLI = "sqli"
    XSS = "xss"
    IDOR = "idor"
    BROKEN_AUTH = "broken_auth"
    MISCONFIG = "misconfig"
    OTHER = "other"


class SeverityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    NEEDS_MORE_INFO = "needs_more_info"
    APPROVED = "approved"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"


class SubmissionMessage(BaseModel):
    sender_id: str
    sender_role: str
    message: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)


class SubmissionBase(BaseModel):
    program_id: str = Field(..., min_length=1)
    vuln_type: VulnerabilityType
    severity: SeverityLevel
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    steps_to_reproduce: str = Field(..., min_length=10)


class SubmissionCreate(SubmissionBase):
    poc_files: Optional[List[str]] = []


class SubmissionResponse(SubmissionBase):
    id: str = Field(..., alias="_id")
    submitted_by: str
    status: SubmissionStatus = SubmissionStatus.PENDING
    points_awarded: int = 0
    reward_amount: float = 0
    is_first_finder: bool = False
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    poc_files: Optional[List[str]] = []
    messages: Optional[List[dict]] = []

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )


class SubmissionInDB(SubmissionResponse):
    internal_notes: Optional[str] = None
