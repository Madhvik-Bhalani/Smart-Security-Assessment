from pydantic import BaseModel, EmailStr, Field, model_validator
import re
from typing import Optional
from datetime import datetime, timezone


# ... = Required
class UserSignup(BaseModel):
    fname: str = Field(..., min_length=1, description="Please fill your first name")
    lname: str = Field(..., min_length=1, description="Please fill your last name")
    email: EmailStr = Field(..., description="Please provide a valid email address")
    password: str = Field(
        ..., min_length=6, description="Password must meet security criteria"
    )
    confirm_password: str = Field(..., min_length=6, description="Passwords must match")
    token: Optional[str] = Field(None, description="JWT token for the user")
    active: Optional[bool] = Field(default=True, description="Is the user active?")
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    """
    Validate the relationship between fields before creating the model/class instance.
    """

    @model_validator(mode="before")
    @classmethod
    def validate_password_match(cls, values):
        password = values.get("password")
        confirm_password = values.get("confirm_password")
        if password != confirm_password:
            raise ValueError("Password and confirm password do not match")
        return values

    """
    Validate the complexity of the 'password' field after creating the model/class instance.
    """

    @model_validator(mode="after")
    def validate_password_complexity(cls, instance):
        password = instance.password
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if not any(char.isupper() for char in password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in password):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise ValueError("Password must contain at least one special character")
        return instance


class UserSignin(BaseModel):
    email: EmailStr = Field(..., description="Please provide a valid email address")
    password: str = Field(
        ..., min_length=6, description="Password is required for signing in"
    )


class UserChangePassword(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")
    old_password: str = Field(..., min_length=6, description="Your current password")
    new_password: str = Field(..., min_length=6, description="Your new password")



class UserEditAccount(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")
    fname: Optional[str] = Field(None, description="Updated first name")
    lname: Optional[str] = Field(None, description="Updated last name")


class UserUploadPhoto(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")
    profile_photo_url: str = Field(..., description="URL of the profile photo to be uploaded")


class UserDeletePhoto(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")

        
class UserDeleteAccount(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")

class SubscriptionRequest(BaseModel):
    plan_name: str
    duration: str
    email: str = Field(..., description="Please provide your registered email address")
    
class UserUploadReport(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")
    file_name: str = Field(..., description="Name of the uploaded report file")
    base64_file: str = Field(..., description="Base64-encoded PDF file")



class UserGetReports(BaseModel):
    email: EmailStr = Field(..., description="Please provide your registered email address")