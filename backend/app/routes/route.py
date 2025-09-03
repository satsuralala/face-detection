from app.schemas.schema import PersonCreate
from fastapi import APIRouter
from app.models.model import Person
from bson import ObjectId
from fastapi import FastAPI, HTTPException
router = APIRouter()


@router.post("/person")
async def add_person(person: PersonCreate):
    new_person = Person(**person.dict())
    await new_person.insert()
    return {"status": "success", "person": new_person}


@router.get("/person/{id}")
async def get_person(id: str):
    try:
        object_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Person ID format")

    item = await Person.find_one({"_id": object_id})
    if item:
        return item
    else:
        raise HTTPException(status_code=404, detail="Person not found")


@router.get("/people")
async def list_persons():
    persons = await Person.find_all().to_list()
    return {"persons": persons}
