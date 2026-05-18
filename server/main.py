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
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins == "*" or not env_origins:
    allowed_origins = ["*"]
    allow_all_origins = True
else:
    allowed_origins = env_origins.split(",")
    allow_all_origins = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=not allow_all_origins,  # Credentials NOT allowed with "*"
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
