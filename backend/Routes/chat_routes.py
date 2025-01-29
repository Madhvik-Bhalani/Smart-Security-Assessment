from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from Models.chat_model import Message, ChatSession
from pydantic import BaseModel
from Controllers.chat_controller import ChatController
from Middleware.auth import Auth

router = APIRouter()
chat_controller = ChatController()


class RenameRequest(BaseModel):
    new_chat_name: str

class DeleteRequest(BaseModel):
    session_id: str

@router.post("/chat/{session_id}", tags=["Chat"])
async def save_message(
    request: Request,
    body: Message,
    user_id: str = Depends(Auth.verify_token),
    session_id: Optional[str] = None,
):
    try:
        updated_session = await chat_controller.save_message_or_create_new(
            session_id=session_id,
            user_id=user_id,
            message=body.userPrompt,
            request=request,
        )
        return {"status": "success", "session": updated_session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving message: {str(e)}")


@router.post("/newchat", tags=["Chat"])
async def create_new_chat(
    request: Request,  
    user_id: str = Depends(Auth.verify_token)
):
    try:
        new_chat_data = await chat_controller.create_new_session(user_id,request)
        return new_chat_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating chat session: {str(e)}"
        )


@router.get("/chat/{session_id}", tags=["Chat"])
async def fetch_chat_messages(
    session_id: str, request: Request, user_id: str = Depends(Auth.verify_token)
):
    try:
        session_data = await chat_controller.fetch_chat_messages(
            session_id, user_id, request
        )
        return session_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching chat messages: {str(e)}"
        )


@router.get("/chat", tags=["Chat"])
async def fetch_chats(request: Request, user_id: str = Depends(Auth.verify_token)):
    try:
        sessions = await chat_controller.fetch_sessions(user_id, request)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching chat sessions: {str(e)}"
        )


@router.post("/chat/{session_id}/rename", tags=["Chat"])
async def rename_chat(
    session_id: str,
    body: RenameRequest,
    request: Request,
    user_id: str = Depends(Auth.verify_token),
):
    try:
        success = await chat_controller.rename_session(
            session_id, user_id, body.new_chat_name, request
        )
        return {
            "status": "success" if success else "failure",
            "message": (
                f"Chat name has been renamed to {body.new_chat_name}"
                if success
                else "Failed to rename chat name"
            ),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error renaming chat session: {str(e)}"
        )


@router.put("/chat/delete", tags=["Chat"])
async def delete_chat(
    body: DeleteRequest,
    request: Request,
    user_id: str = Depends(Auth.verify_token),
):
    try:
        success = await chat_controller.delete_session(
            body.session_id, user_id, request
        )
        return {
            "status": "success" if success else "failure",
            "message": (
                f"Chat has been deleted "
                if success
                else "Failed to delete chat"
            ),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting chat session: {str(e)}"
        )