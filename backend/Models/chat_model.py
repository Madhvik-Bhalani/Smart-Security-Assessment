from pydantic import BaseModel

class UserPrompt(BaseModel):
    prompt: str
    user_chat_sesion_id: str