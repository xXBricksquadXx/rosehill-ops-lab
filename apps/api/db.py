import os
from functools import lru_cache

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/rosehill_ops")


@lru_cache
def _get_client() -> AsyncIOMotorClient:
    """Return a singleton Mongo client for the process."""
    return AsyncIOMotorClient(MONGO_URL)


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the default database from the Mongo client.

    In Docker, MONGO_URL is set to mongodb://mongo:27017/rosehill_ops.
    Locally (bare metal) it falls back to localhost.
    """
    client = _get_client()
    return client.get_default_database()
