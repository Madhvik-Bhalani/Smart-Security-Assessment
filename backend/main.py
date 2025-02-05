from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import logging
import subprocess

# Routes
from Routes.user_routes import router as user_router
from Routes.chat_routes import router as chat_router
from Routes.cve_routes import router as cve_router

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
    CORSMiddleware,  # Allow all origins
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {"Welcome to the Astra's API World"}


@app.get("/scan/")
def run_nikto(url: str):
    command = ["perl", "vendors/Web_Safe_Guard/nikto/program/nikto.pl", "-h", url]

    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=20)
        return {"Nikto Output": result.stdout, "Nikto Errors": result.stderr}
    except subprocess.TimeoutExpired  as e:
        return {"error": "Nikto scan timed out!", "data":  e.stdout}
    except subprocess.CalledProcessError as e:
        return {"error": f"Nikto scan failed: {e}"}
    except FileNotFoundError:
        return {"error": "Nikto script not found!"}
    
    
# Include user routes
app.include_router(user_router, prefix="/api/v1/users")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(cve_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))
    print(f"Backend Server Started At => {PORT}")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
