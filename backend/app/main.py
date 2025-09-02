from fastapi import FastAPI
from app.core.database import connect_to_mongo
from app.routes.info import router as info_router
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI(title="My FastAPI + MongoDB Project")


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()


app.include_router(info_router, prefix="/api")
