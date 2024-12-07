import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain.prompts.chat import ChatPromptTemplate
from langchain_groq.chat_models import ChatGroq
from dotenv import load_dotenv


load_dotenv()

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Smart Security Assistant API",
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
)

# Load API keys and model details
groq_api_key = os.getenv("GROQ_API_KEY")
model_name = os.getenv("MODEL_NAME")
if not groq_api_key or not model_name:
    raise Exception("Missing GROQ_API_KEY or MODEL_NAME in .env file.")

# Initialize the ChatGroq model
chat_model = ChatGroq(
    model=model_name,
    temperature=0.7,
    groq_api_key=groq_api_key,
)


# Define Pydantic model for user input
class UserMessage(BaseModel):
    prompt: str  # User's query or input


# Define the ChatPromptTemplate
chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are a smart cybersecurity assistant specializing in security analysis, compliance with standards like NIST and ISO, vulnerability identification, mitigation strategies, audit documentation, recent CVE analysis, and providing concise, actionable advice."
            ),
        ),
        ("user", "{prompt}"),
    ]
)


@app.post("/chat", tags=["Chats"])
async def chat_with_assistant(user_message: UserMessage):
    try:
        # Process the user input through the conversation chain
        response = chat_model.invoke(input=user_message.prompt)
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/", tags=["General"])
async def root():
    return {"message": "Smart Security Assistant Chat API is running"}


if __name__ == "__main__":
    # Get configuration from environment variables using os.getenv
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))

    # Run the app
    uvicorn.run("app:app", host=host, port=port, reload=True)
