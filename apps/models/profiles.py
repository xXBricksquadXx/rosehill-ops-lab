from typing import Optional

from pydantic import BaseModel


class Profile(BaseModel):
    id: str
    key: str
    label: str
    description: Optional[str] = None
