from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import logging

from Routes.user_routes import router as user_router

# Load environment variables
load_dotenv()

# MongoDB connection URI and Database Name
DATABASE_CON_URI = os.getenv("DATABASE_CON_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages startup and shutdown tasks for FastAPI application.
    """
    # Connect to MongoDB
    try:
        app.mongodb_client = AsyncIOMotorClient(DATABASE_CON_URI)
        app.mongodb = app.mongodb_client[DATABASE_NAME]
        print("MongoDB connected successfully.")
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        raise Exception(f"Failed to connect to MongoDB: {e}")

    yield  # Application runs here

    # Disconnect from MongoDB
    try:
        app.mongodb_client.close()
        print("MongoDB connection closed.")
    except Exception as e:
        logging.error(f"Error closing MongoDB connection: {e}")
        raise Exception(f"Failed to close MongoDB connection: {e}")


# Initialize FastAPI app with metadata
app = FastAPI(
    title="Astra - Smart Security Assistant API",
    description=(
        "An API for a smart cybersecurity assistant, developed by team-codefinity. "
        "This assistant is powered by LangChain and Groq, offering insights, analysis, "
        "and support for various cybersecurity tasks, including standards compliance, "
        "vulnerability mitigation, and audit documentation."
    ),
    version="1.0.0",
    contact={
        "name": "Developer Support",
        "url": "https://team-codefinity.vercel.app/",
        "email": "info.codefinity@gmail.com",
    },
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include user routes
app.include_router(user_router, prefix="/api/v1/users")


if __name__ == "__main__":
    import uvicorn

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))
    print(f"Backend Server Started At => {PORT}")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
