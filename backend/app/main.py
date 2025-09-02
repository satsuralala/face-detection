from fastapi import FastAPI
from app.core.database import connect_to_mongo
from app.routes.info import router as info_router

app = FastAPI(title="My FastAPI + MongoDB Project")


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()


app.include_router(info_router, prefix="/info")
