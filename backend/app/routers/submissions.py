from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.submission import SubmissionCreate, SubmissionStatus
from app.services.submission_service import submission_service
from app.dependencies import get_current_user, rate_limit_submit
from app.utils.file_handler import save_poc_file

router = APIRouter()


class ReplyMessage(BaseModel):
    message: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_submission(
    program_id: str = Form(...),
    vuln_type: str = Form(...),
    severity: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    steps_to_reproduce: str = Form(...),
    poc_files: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    _= Depends(rate_limit_submit),
):
    """Submit a new bug report with optional PoC file attachments."""
    saved_paths = []
    if poc_files:
        for f in poc_files:
            path = await save_poc_file(f)
            saved_paths.append(path)

    submission_data = SubmissionCreate(
        program_id=program_id,
        vuln_type=vuln_type,
        severity=severity,
        title=title,
        description=description,
        steps_to_reproduce=steps_to_reproduce,
        poc_files=saved_paths,
    )
    return await submission_service.create_submission(db, current_user["_id"], submission_data)


@router.get("/me")
async def my_submissions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    cursor = db.submissions.find({"submitted_by": current_user["_id"]}).sort("submitted_at", -1)
    docs = await cursor.to_list(length=100)
    for d in docs:
        d["_id"] = str(d["_id"]) if isinstance(d.get("_id"), ObjectId) else d.get("_id")
    return docs


@router.get("/{submission_id}")
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID.")
    sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    is_owner = sub["submitted_by"] == current_user["_id"]
    is_admin = current_user.get("role") == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized.")
    sub["_id"] = str(sub["_id"])
    return sub


@router.post("/{submission_id}/reply")
async def reply_to_admin(
    submission_id: str,
    reply: ReplyMessage,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Authenticated user replies to admin's request for more details."""
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID.")
    sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    if sub["submitted_by"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not your submission.")

    msg_doc = {
        "sender_id": current_user["_id"],
        "sender_role": "user",
        "message": reply.message,
        "sent_at": datetime.utcnow().isoformat(),
    }
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$push": {"messages": msg_doc}}
    )
    return {"detail": "Reply sent.", "message": msg_doc}
