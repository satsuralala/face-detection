import os
from dotenv import load_dotenv

load_dotenv()  # load .env

MONGO_URI = os.getenv("MONGODB_URI")
