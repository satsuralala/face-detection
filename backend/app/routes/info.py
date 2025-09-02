from fastapi import APIRouter
from app.models.user import User

router = APIRouter()


@router.get("/")
async def get_users():
    users = await User.find_all().to_list()
    return {"users": users}
