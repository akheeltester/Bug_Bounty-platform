from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.program import ProgramCreate, ProgramUpdate
from app.utils.security import get_password_hash
from app.dependencies import get_current_admin

router = APIRouter()


def _serialize(doc: dict) -> dict:
    """Convert ObjectId → str for JSON serialization."""
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_programs(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db.programs.find({"is_active": True}, {"hashed_flag": 0})
    programs = await cursor.to_list(length=100)
    return [_serialize(p) for p in programs]


@router.get("/{program_id}")
async def get_program(program_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    if not ObjectId.is_valid(program_id):
        raise HTTPException(status_code=400, detail="Invalid program ID.")
    program = await db.programs.find_one(
        {"_id": ObjectId(program_id), "is_active": True},
        {"hashed_flag": 0},
    )
    if not program:
        raise HTTPException(status_code=404, detail="Program not found.")
    return _serialize(program)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_program(
    program_in: ProgramCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Admin only: create a new bug bounty program."""
    program_data = program_in.model_dump(exclude={"flag"})
    # Pydantic HttpUrl returns a Url object — convert to plain string for MongoDB
    program_data["access_url"] = str(program_data["access_url"])
    # Only hash flag if provided (backward compatible with old programs that had flags)
    if program_in.flag:
        program_data["hashed_flag"] = get_password_hash(program_in.flag)
    program_data["is_active"] = True
    result = await db.programs.insert_one(program_data)
    created = await db.programs.find_one({"_id": result.inserted_id}, {"hashed_flag": 0})
    return _serialize(created)


@router.patch("/{program_id}")
async def update_program(
    program_id: str,
    program_in: ProgramUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Admin only: update an existing program."""
    if not ObjectId.is_valid(program_id):
        raise HTTPException(status_code=400, detail="Invalid program ID.")
    program = await db.programs.find_one({"_id": ObjectId(program_id)})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found.")

    update_data = program_in.model_dump(exclude_unset=True)
    if "access_url" in update_data and update_data["access_url"] is not None:
        update_data["access_url"] = str(update_data["access_url"])

    if update_data:
        await db.programs.update_one(
            {"_id": ObjectId(program_id)},
            {"$set": update_data}
        )

    updated = await db.programs.find_one({"_id": ObjectId(program_id)}, {"hashed_flag": 0})
    return _serialize(updated)


@router.patch("/{program_id}/toggle")
async def toggle_program(
    program_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Admin only: activate or deactivate a program."""
    if not ObjectId.is_valid(program_id):
        raise HTTPException(status_code=400, detail="Invalid program ID.")
    program = await db.programs.find_one({"_id": ObjectId(program_id)})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found.")
    new_state = not program.get("is_active", True)
    await db.programs.update_one({"_id": ObjectId(program_id)}, {"$set": {"is_active": new_state}})
    return {"program_id": program_id, "is_active": new_state}
