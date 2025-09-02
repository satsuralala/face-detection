from pydantic import BaseModel


class PersonCreate(BaseModel):
    img: str
    name: str
    age: str
    last_seen_data: str
    phone_number: str
    last_seen_location: str
    add_info: str
