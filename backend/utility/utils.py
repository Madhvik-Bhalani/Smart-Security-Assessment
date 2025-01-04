from bson import ObjectId
from datetime import datetime
from typing import Any
from pydantic import BaseModel


def to_serializable(data: Any) -> Any:
    """
    Convert data into a JSON-serializable format.
    Handles:
    - MongoDB ObjectId: Converts to string
    - datetime: Converts to ISO 8601 string
    - Pydantic models: Uses `dict()` for serialization
    - Lists and dictionaries: Recursively processes them
    """
    if isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, BaseModel):
        return data.dict()
    elif isinstance(data, list):
        return [to_serializable(item) for item in data]
    elif isinstance(data, dict):
        return {key: to_serializable(value) for key, value in data.items()}
    else:
        return data
