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

# Allow all origins in a way that also supports credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
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
