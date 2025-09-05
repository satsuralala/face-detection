from pydantic import BaseModel
from bson import ObjectId
from typing import List

from typing import Optional


class PersonCreate(BaseModel):
    _id: Optional[ObjectId] = None
    img: str
    name: str
    age: str
    last_seen_data: str
    phone_number: str
    last_seen_location: str
    add_info: str
    embedding: Optional[List[float]] = None
