from pydantic import BaseModel

class UserPrompt(BaseModel):
    prompt: str
    user_chat_session_id: str