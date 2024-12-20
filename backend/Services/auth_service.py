from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
import os

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables for token generation
TOKEN_SECRET_KEY = os.getenv("TOKEN_SECRET_KEY")
TOKEN_EXPIRE_DAYS = int(os.getenv("TOKEN_EXPIRE_DAYS", 1))


"""Hash the password using bcrypt."""
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


"""Verify a plaintext password against a hashed password."""
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


"""Generate a JWT token."""
def create_access_token(data: dict) -> str:
    #data = _id 
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire}) #Adds an expiration datetime (exp) to the payload.
    return jwt.encode(data, TOKEN_SECRET_KEY, algorithm="HS256")
