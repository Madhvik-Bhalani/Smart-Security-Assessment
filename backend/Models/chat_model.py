from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone


class Message(BaseModel):
    sender: Optional[str] = Field(
        None,
        description="Sender of the message ('user' or 'bot'). Defaults to None if not provided.",
    )
    userPrompt: Optional[str] = Field(None, description="Text content of the message.")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the message was sent.",
    )


class ChatSession(BaseModel):
    session_id: str = Field(
        ...,
        description="Unique ID for the chat session. Optional if the controller generates it.",
    )
    user_id: str = Field(..., description="ID of the user owning the session.")
    chat_name: Optional[str] = Field(
        default="Untitled Chat",  # Default chat name
        description="Name of the chat session. Defaults to 'Untitled Chat'.",
    )
    messages: List[Message] = Field(
        default_factory=list,
        description="List of messages exchanged in this chat session.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when the chat session was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when the chat session was last updated.",
    )
