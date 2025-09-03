from fastapi import FastAPI
from app.core.database import connect_to_mongo
from app.routes.route import router as info_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My FastAPI + MongoDB Project")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()


app.include_router(info_router, prefix="/api")
