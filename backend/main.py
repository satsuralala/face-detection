from fastapi import FastAPI
from app.core.database import connect_to_mongo
from app.routes.route import router as info_router
from app.models.model import Person
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My FastAPI + MongoDB Project")


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
