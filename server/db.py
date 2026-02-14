import os

from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGODB_DB", "dermsight")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[MONGO_DB]


async def ping_db() -> None:
    await db.command("ping")
