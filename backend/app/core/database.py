from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.model import Person
from app.core.config import MONGO_URI


async def connect_to_mongo():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_default_database()
    await init_beanie(database=db, document_models=[Person])
    print("✅ MongoDB connected")
