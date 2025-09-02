from backend.app.schemas.schema import PersonCreate
from fastapi import APIRouter
from backend.app.models.model import User, Person

router = APIRouter()


@router.get("/")
async def get_users():
    users = await User.find_all().to_list()
    return {"users": users}


@router.post("/person")
async def add_person(person: PersonCreate):
    new_person = Person(**person.dict())
    await new_person.insert()
    return {"status": "success", "person": new_person}


@router.get("/people")
async def list_persons():
    persons = await Person.find_all().to_list()
    return {"persons": persons}
