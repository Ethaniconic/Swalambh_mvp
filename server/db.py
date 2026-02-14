import os

from dotenv import find_dotenv, load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

dotenv_path = find_dotenv(".env", usecwd=True)
if dotenv_path:
    load_dotenv(dotenv_path, override=True)
else:
    load_dotenv(override=True)

MONGO_URI = os.getenv("MONGODB_URI", "").strip()
if not MONGO_URI:
    raise RuntimeError("MONGODB_URI is not set. Add it to .env or the environment.")

MONGO_DB = os.getenv("MONGODB_DB", "dermsight")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[MONGO_DB]


async def ping_db() -> None:
    await db.command("ping")
