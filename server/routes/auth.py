from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..auth import hash_password, verify_password
from ..db import db
from ..models import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


def _user_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        email=doc["email"],
        full_name=doc.get("full_name"),
        role=doc.get("role"),
        created_at=doc["created_at"],
    )


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = {
        "email": payload.email,
        "full_name": payload.full_name,
        "role": payload.role,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _user_public(doc)


@router.post("/login", response_model=UserPublic)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return _user_public(user)


@router.post("/forgot", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(payload: ForgotPasswordRequest):
    user = await db.users.find_one({"email": payload.email})
    if not user:
        return {"message": "If the account exists, a reset link will be sent."}

    reset_doc = {
        "user_id": ObjectId(user["_id"]),
        "created_at": datetime.utcnow(),
        "used": False,
    }
    await db.password_resets.insert_one(reset_doc)
    return {"message": "If the account exists, a reset link will be sent."}
