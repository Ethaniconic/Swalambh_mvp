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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173"],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):(5173|4173)$",
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
