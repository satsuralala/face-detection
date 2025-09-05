from beanie import Document
from bson import ObjectId
from typing import List  # <- correct import for List

from typing import Optional


class Person(Document):
    _id: Optional[ObjectId] = None
    img: str
    name: str
    age: str
    last_seen_data: str
    phone_number: str
    last_seen_location: str
    add_info: str
    embedding: Optional[List[float]] = None
