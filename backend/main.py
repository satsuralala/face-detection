from fastapi import FastAPI, HTTPException
from app.core.database import connect_to_mongo
from app.routes.route import router as info_router
from app.models.model import Person
from app.schemas.schema import PersonCreate
from fastapi.middleware.cors import CORSMiddleware
import base64
import numpy as np
import cv2
from models.arcface.index import ArcFaceModel

app = FastAPI(title="My FastAPI + MongoDB Project")

arcface = ArcFaceModel(ctx_id=0)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        await connect_to_mongo()
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        print("📝 Running in demo mode with mock data")


@app.post("/api/person")
async def add_person(person: PersonCreate):
    try:
        img_data = base64.b64decode(person.img.split(",")[-1])
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Decoded image is None")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

    embedding = arcface.get_embedding_from_frame(img)
    if embedding is None:
        raise HTTPException(
            status_code=400, detail="No face detected in image")

    embedding_list = embedding.tolist()

    new_person_data = person.dict()
    new_person_data["embedding"] = embedding_list
    new_person = Person(**new_person_data)
    await new_person.insert()

    return {"status": "success", "person": new_person}


@app.get("/api/list_persons")
async def list_persons():
    try:
        persons = await Person.find_all().to_list()
        return {"persons": persons}
    except Exception as e:
        # For demo purposes, return mock data if database is not available
        print(f"Database error: {e}")
        mock_persons = [
            {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Батбаяр",
                "age": "25",
                "last_seen_data": "2024-01-15",
                "phone_number": "+976-99887766",
                "last_seen_location": "Улаанбаатар хот",
                "add_info": "Хар үстэй, өндөр биетэй",
                "img": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA="
            },
            {
                "_id": "507f1f77bcf86cd799439012", 
                "name": "Сарангэрэл",
                "age": "32",
                "last_seen_data": "2024-01-10",
                "phone_number": "+976-88776655",
                "last_seen_location": "Дархан хот",
                "add_info": "Урт үстэй, дунд биетэй",
                "img": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA="
            }
        ]
        return {"persons": mock_persons}


app.include_router(info_router, prefix="/api")
