from fastapi import FastAPI
from app.core.database import connect_to_mongo

app = FastAPI(title="My FastAPI + MongoDB Project")


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()


app.include_router(info, prefix="/info")
