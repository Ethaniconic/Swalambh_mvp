import os

from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", )
MONGO_DB = os.getenv("MONGODB_DB", "dermsight")

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[MONGO_DB]


async def ping_db() -> None:
    await db.command("ping")
