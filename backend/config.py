import os
from dotenv import load_dotenv

load_dotenv()  # reads .env file into environment variables

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False   # disables a Flask warning, always set this False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")