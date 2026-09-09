from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.submission import SubmissionStatus
from app.services.submission_service import submission_service
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/submissions/pending")
async def pending_submissions(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    cursor = db.submissions.find({"status": SubmissionStatus.PENDING}).sort("submitted_at", -1)
    docs = await cursor.to_list(length=200)
    for d in docs:
        if isinstance(d.get("_id"), ObjectId):
            d["_id"] = str(d["_id"])
    return docs


@router.post("/submissions/{submission_id}/review")
async def review(
    submission_id: str,
    decision: str = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if decision not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Decision must be 'approve' or 'reject'.")
    return await submission_service.review_submission(db, submission_id, admin["_id"], decision)


@router.get("/submissions/all")
async def all_submissions(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    cursor = db.submissions.find(query).sort("submitted_at", -1)
    docs = await cursor.to_list(length=500)
    for d in docs:
        if isinstance(d.get("_id"), ObjectId):
            d["_id"] = str(d["_id"])
    return docs


@router.post("/submissions/{submission_id}/message")
async def send_message_to_user(
    submission_id: str,
    message: str = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Admin sends a message requesting more details from the reporter."""
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID.")
    sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    msg_doc = {
        "sender_id": admin["_id"],
        "sender_role": "admin",
        "message": message,
        "sent_at": datetime.utcnow().isoformat(),
    }
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$push": {"messages": msg_doc}, "$set": {"status": "needs_more_info"}}
    )
    return {"detail": "Message sent to reporter.", "message": msg_doc}


@router.get("/programs")
async def all_programs(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    cursor = db.programs.find({}, {"hashed_flag": 0})
    docs = await cursor.to_list(length=100)
    for d in docs:
        if isinstance(d.get("_id"), ObjectId):
            d["_id"] = str(d["_id"])
    return docs


@router.get("/leaderboard")
async def admin_leaderboard(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    cursor = db.users.find({"role": "participant"}, {"hashed_password": 0}).sort("total_earnings", -1)
    docs = await cursor.to_list(length=200)
    for i, d in enumerate(docs):
        d["_id"] = str(d["_id"])
        d["rank"] = i + 1
    return docs
