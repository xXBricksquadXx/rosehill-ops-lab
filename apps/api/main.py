from pathlib import Path
import json
from typing import List, Optional

from fastapi import Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from db import get_database


class Profile(BaseModel):
    id: str
    key: str
    label: str
    description: Optional[str] = None


app = FastAPI(
    title="Rosehill Ops Lab API",
    version="0.1.0",
    description="Backend for small-ops efficiency: HR / Service / Parts / Delivery & BOL.",
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "rosehill-ops-api",
        "version": "0.1.0",
    }


@app.get("/db-ping")
async def db_ping(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Simple DB ping to verify Mongo connectivity from the API container.
    """
    await db.command("ping")
    return {"status": "ok", "database": str(db.name)}


@app.get("/profiles", response_model=List[Profile])
async def list_profiles(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    List all profession profiles (HR / Service / Parts / Delivery & BOL).
    """
    docs = await db["profiles"].find().to_list(length=50)
    return [
        Profile(
            id=doc["_id"],
            key=doc["key"],
            label=doc["label"],
            description=doc.get("description"),
        )
        for doc in docs
    ]


@app.on_event("startup")
async def seed_profiles() -> None:
    """
    On startup, read profiles_seed.json and upsert the base profiles into Mongo.

    Each profile is stored with _id = key for simple lookup.
    """
    db = get_database()
    profiles_collection = db["profiles"]

    seed_path = Path(__file__).parent / "profiles_seed.json"
    if not seed_path.exists():
        return

    data = json.loads(seed_path.read_text("utf-8"))
    for profile in data:
        doc = {"_id": profile["key"], **profile}
        await profiles_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": doc},
            upsert=True,
        )
