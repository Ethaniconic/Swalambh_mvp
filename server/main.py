import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import mongo_client, ping_db
from .routes import auth_router, predict_router, triage_router, explain_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await ping_db()
    yield
    mongo_client.close()


app = FastAPI(title="DermSight API", lifespan=lifespan)

# Allow origins from environment variable, otherwise fallback to local dev defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(triage_router)
app.include_router(predict_router)
app.include_router(explain_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
