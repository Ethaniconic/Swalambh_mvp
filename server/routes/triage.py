import os
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from pydantic import BaseModel

from ..db import db

router = APIRouter(prefix="/triage", tags=["triage"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
DEFAULT_UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", DEFAULT_UPLOAD_DIR))


class TriageUploadResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size_bytes: int
    note: Optional[str] = None
    created_at: datetime


class TriageCaseSummary(BaseModel):
    id: str
    filename: str
    content_type: str
    size_bytes: int
    note: Optional[str] = None
    created_at: datetime


def _serialize_case(doc: dict) -> TriageCaseSummary:
    return TriageCaseSummary(
        id=str(doc["_id"]),
        filename=doc["filename"],
        content_type=doc["content_type"],
        size_bytes=doc["size_bytes"],
        note=doc.get("note"),
        created_at=doc["created_at"],
    )


def _is_image(content_type: Optional[str]) -> bool:
    return bool(content_type) and content_type.startswith("image/")


def _save_upload(file: UploadFile) -> tuple[str, int]:
    if not _is_image(file.content_type):
        raise HTTPException(status_code=415, detail="Only image uploads are supported")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid4().hex}_{Path(file.filename).name}"
    target = UPLOAD_DIR / safe_name

    size = 0
    with target.open("wb") as buffer:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                buffer.close()
                target.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File exceeds 10MB limit")
            buffer.write(chunk)

    return str(target), size


@router.post("/upload", response_model=TriageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_case(
    image: UploadFile = File(...),
    note: Optional[str] = Form(default=None),
):
    file_path, size = _save_upload(image)
    doc = {
        "filename": Path(file_path).name,
        "content_type": image.content_type or "image/*",
        "size_bytes": size,
        "note": note,
        "created_at": datetime.utcnow(),
    }
    result = await db.triage_cases.insert_one(doc)
    return TriageUploadResponse(id=str(result.inserted_id), **doc)


@router.get("/cases", response_model=list[TriageCaseSummary])
async def list_cases(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    cursor = (
        db.triage_cases.find({})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    cases = [ _serialize_case(doc) async for doc in cursor ]
    return cases


@router.get("/cases/{case_id}", response_model=TriageCaseSummary)
async def get_case(case_id: str):
    try:
        oid = ObjectId(case_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid case id") from exc

    doc = await db.triage_cases.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Case not found")

    return _serialize_case(doc)
