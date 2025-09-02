# user.py (Beanie model)
from beanie import Document


class User(Document):
    name: str
    age: int
