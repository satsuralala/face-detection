from beanie import Document
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class User(Document):
    """User model for the missing person database"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "missing"  # missing, found, etc.
    created_at: datetime = datetime.utcnow()
    last_seen: Optional[datetime] = None
    location: Optional[str] = None
    
    class Settings:
        name = "users"