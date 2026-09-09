import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException, status

from app.config import settings

ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "video/mp4",
]
ALLOWED_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".mp4",
]

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_poc_file(file: UploadFile) -> str:
    """Validate MIME type, extension, size — then save to UPLOAD_DIR."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Only .jpg, .jpeg, .png, and .mp4 are accepted.")
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"MIME type '{file.content_type}' not allowed. Only images (JPEG/PNG) and MP4 videos are accepted.")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max 5MB.")

    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / filename
    async with aiofiles.open(save_path, "wb") as out:
        await out.write(contents)

    return f"/uploads/{filename}"
