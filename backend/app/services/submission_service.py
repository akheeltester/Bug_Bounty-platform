from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.models.submission import (
    SubmissionCreate,
    SubmissionStatus,
)
from app.config import settings


class SubmissionService:

    @staticmethod
    async def create_submission(
        db: AsyncIOMotorDatabase,
        user_id: str,
        submission_in: SubmissionCreate,
    ) -> dict:
        if not ObjectId.is_valid(submission_in.program_id):
            raise HTTPException(status_code=400, detail="Invalid program ID.")
        program = await db.programs.find_one({
            "_id": ObjectId(submission_in.program_id),
            "is_active": True,
        })
        if not program:
            raise HTTPException(status_code=404, detail="Active program not found.")

        existing = await db.submissions.find_one({
            "submitted_by": user_id,
            "title": submission_in.title,
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail="You already submitted a report with this title.",
            )

        doc = submission_in.model_dump()
        doc["submitted_by"] = user_id
        doc["status"] = SubmissionStatus.PENDING
        doc["submitted_at"] = datetime.utcnow()
        doc["points_awarded"] = 0
        doc["reward_amount"] = 0
        doc["is_first_finder"] = False
        doc["reviewed_at"] = None
        doc["reviewed_by"] = None
        doc["poc_files"] = doc.get("poc_files") or []
        doc["messages"] = []

        result = await db.submissions.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    @staticmethod
    async def check_first_approved(
        db: AsyncIOMotorDatabase,
        program_id: str,
        vuln_type: str,
    ) -> Optional[dict]:
        return await db.submissions.find_one({
            "program_id": program_id,
            "vuln_type": vuln_type,
            "status": SubmissionStatus.APPROVED,
        })

    @staticmethod
    def calculate_points(severity: str, is_first_finder: bool) -> int:
        base = settings.severity_points_map.get(severity, 0)
        bonus = settings.first_finder_bonus_map.get(severity, 0) if is_first_finder else 0
        return base + bonus

    @staticmethod
    def calculate_reward(severity: str, program: dict) -> float:
        """Calculate reward amount based on severity and program reward criteria."""
        reward_map = {
            "critical": program.get("reward_critical", 0),
            "high": program.get("reward_high", 0),
            "medium": program.get("reward_medium", 0),
            "low": program.get("reward_low", 0),
        }
        return reward_map.get(severity, 0)

    @staticmethod
    async def review_submission(
        db: AsyncIOMotorDatabase,
        submission_id: str,
        admin_id: str,
        decision: str,
    ) -> dict:
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID.")

        sub = await db.submissions.find_one({"_id": ObjectId(submission_id)})
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found.")
        if sub["status"] not in [SubmissionStatus.PENDING, SubmissionStatus.NEEDS_MORE_INFO]:
            raise HTTPException(status_code=400, detail="Submission already reviewed.")

        new_status = SubmissionStatus.APPROVED if decision == "approve" else SubmissionStatus.REJECTED
        points = 0
        reward = 0
        is_first = False

        if new_status == SubmissionStatus.APPROVED:
            first = await SubmissionService.check_first_approved(
                db, sub["program_id"], sub["vuln_type"]
            )
            is_first = first is None

            # Calculate legacy points (backward compatibility)
            points = SubmissionService.calculate_points(sub["severity"], is_first)

            # Calculate reward amount from program criteria
            program = await db.programs.find_one({"_id": ObjectId(sub["program_id"])})
            if program:
                reward = SubmissionService.calculate_reward(sub["severity"], program)

            try:
                user_oid = ObjectId(sub["submitted_by"]) if ObjectId.is_valid(sub["submitted_by"]) else sub["submitted_by"]
                await db.users.update_one(
                    {"_id": user_oid},
                    {"$inc": {"points": points, "total_earnings": reward}}
                )
            except Exception:
                pass

        await db.submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "status": new_status,
                "reviewed_by": admin_id,
                "reviewed_at": datetime.utcnow(),
                "points_awarded": points,
                "reward_amount": reward,
                "is_first_finder": is_first,
            }}
        )

        sub.update({
            "status": new_status,
            "points_awarded": points,
            "reward_amount": reward,
            "is_first_finder": is_first,
            "_id": str(sub["_id"]),
        })
        return sub


submission_service = SubmissionService()
