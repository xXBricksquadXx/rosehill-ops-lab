from pathlib import Path
import json
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from db import get_database


# ---------- Pydantic models ----------

class Profile(BaseModel):
    id: str
    key: str
    label: str
    description: Optional[str] = None


class WorkItem(BaseModel):
    id: str
    profile_key: str  # "hr", "service", "parts", "delivery_bol"
    title: str
    status: str       # "backlog", "in_progress", "blocked", "done"
    priority: str     # "low", "medium", "high", "urgent"
    assignee: Optional[str] = None
    notes: Optional[str] = None


class WorkItemCreate(BaseModel):
    profile_key: str
    title: str
    status: str = "backlog"
    priority: str = "medium"
    assignee: Optional[str] = None
    notes: Optional[str] = None


# ---------- FastAPI app ----------

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
    await db.command("ping")
    return {"status": "ok", "database": str(db.name)}


# ---------- Profiles ----------

@app.get("/profiles", response_model=List[Profile])
async def list_profiles(db: AsyncIOMotorDatabase = Depends(get_database)):
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


# ---------- Work items (shared task model) ----------

@app.get("/work-items", response_model=List[WorkItem])
async def list_work_items(
    profile_key: Optional[str] = Query(
        default=None, description="Filter by profile key (hr/service/parts/delivery_bol)"
    ),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    query: dict = {}
    if profile_key:
        query["profile_key"] = profile_key

    docs = (
        await db["work_items"]
        .find(query)
        .sort("priority", -1)  # crude sort, just for demo
        .to_list(length=200)
    )

    return [
        WorkItem(
            id=doc["_id"],
            profile_key=doc["profile_key"],
            title=doc["title"],
            status=doc["status"],
            priority=doc["priority"],
            assignee=doc.get("assignee"),
            notes=doc.get("notes"),
        )
        for doc in docs
    ]


@app.post("/work-items", response_model=WorkItem, status_code=201)
async def create_work_item(
    payload: WorkItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    wi_id = str(uuid4())
    doc = {"_id": wi_id, **payload.dict()}
    await db["work_items"].insert_one(doc)
    return WorkItem(id=wi_id, **payload.dict())


# ---------- Startup seeding ----------

async def _seed_profiles(db: AsyncIOMotorDatabase) -> None:
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


async def _seed_work_items(db: AsyncIOMotorDatabase) -> None:
    work_items_collection = db["work_items"]

    seed_path = Path(__file__).parent / "work_items_seed.json"
    if not seed_path.exists():
        return

    data = json.loads(seed_path.read_text("utf-8"))
    for item in data:
        doc = {"_id": item["id"], **item}
        await work_items_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": doc},
            upsert=True,
        )


@app.on_event("startup")
async def on_startup() -> None:
    db = get_database()
    await _seed_profiles(db)
    await _seed_work_items(db)
