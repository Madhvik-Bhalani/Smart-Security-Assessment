from bson import ObjectId
from datetime import datetime
from typing import Any
from pydantic import BaseModel
import uuid

from typing import Any
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

def to_serializable(data: Any) -> Any:
    """
    Universal serialization function that:
    - Converts MongoDB ObjectId to string.
    - Converts datetime to ISO 8601 string.
    - Serializes Pydantic models to dictionaries.
    - Flattens nested lists into a single list.
    - Recursively processes dictionaries and lists.
    - Handles any nested structure gracefully.
    - Leaves primitive types (int, str, bool, etc.) untouched.
    """
    # Handle MongoDB ObjectId
    if isinstance(data, ObjectId):
        return str(data)
    
    # Handle datetime
    elif isinstance(data, datetime):
        return data.isoformat()
    
    # Handle Pydantic models
    elif isinstance(data, BaseModel):
        return data.dict()
    
    # Handle lists and nested lists
    elif isinstance(data, list):
        # Flatten and process the list
        flat_list = []
        for item in data:
            if isinstance(item, list):  # Flatten nested lists
                flat_list.extend(to_serializable(item))
            else:
                flat_list.append(to_serializable(item))
        return flat_list

    # Handle dictionaries
    elif isinstance(data, dict):
        # Recursively process dictionary key-value pairs
        return {key: to_serializable(value) for key, value in data.items()}
    
    # Return primitive types as is
    else:
        return data



def generate_session_id():
    """
    Generate a unique session ID.
    """
    return str(uuid.uuid4())