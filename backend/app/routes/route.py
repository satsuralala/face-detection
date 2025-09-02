from app.schemas.schema import PersonCreate
from fastapi import APIRouter, Form
from app.models.model import Person
import cloudinary
import cloudinary.uploader
from fastapi import File, UploadFile
import json
from typing import Annotated


cloudinary.config(
    cloud_name="dlb659h6k",
    api_key="898467165237294",
    api_secret="Ahj_Ir26lqAVJix7x6cFVLHLbE4"
)

router = APIRouter()


@router.post("/person")
async def add_person(
    person: Annotated[str, Form()],
    file: UploadFile = File(...)
):
    # Parse the JSON string from form data
    person_data = json.loads(person)
    person_create = PersonCreate(**person_data)

    result = cloudinary.uploader.upload(file.file, folder="people_images")
    image_url = result.get("secure_url")

    new_person = Person(**person_create.dict(), image_url=image_url)
    await new_person.insert()
    return {"status": "success", "person": new_person}


@router.get("/people")
async def list_persons():
    persons = await Person.find_all().to_list()
    return {"persons": persons}
