from fastapi import APIRouter, Depends, Request, HTTPException
from Models.chat_model import UserPrompt
from Controllers.chat_controller import ChatController
from fastapi.responses import JSONResponse

router = APIRouter()

chat_controller = ChatController()

@router.post("/chat", tags=["Chats"])
async def chat_with_assistant(user_message: UserPrompt, request: Request):
    """
    Chat API for interacting with the cybersecurity assistant.

    Parameters:
        - `prompt` (str): User's query.
        - `user_chat_sesion_id` (str): Unique session ID for maintaining chat history.

    Returns:
    - JSON: {"response": <Chatbot's reply>}.

    Errors:
    - HTTP 500 if an exception occurs.
    """
    try:
        response = await chat_controller.process_prompt(user_message.prompt, user_message.user_chat_session_id)        
        
        return JSONResponse(
                status_code=200,
                content={"status": True, "message": "Chatbot's reply", "data": response},
            )
          
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": False, "message": "Something Went Wrong!", "data": str(e)},
        )

