from fastapi import FastAPI
from app.core.database import connect_to_mongo
from app.routes.route import router as info_router
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


app.include_router(info_router, prefix="/api")
