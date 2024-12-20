from Models.user_model import UserSignup, UserSignin
from Services.auth_service import hash_password, verify_password, create_access_token
from datetime import datetime, timezone
from fastapi.responses import JSONResponse
from fastapi import Request

async def signup(user: UserSignup, request: Request):
    users_collection = request.app.mongodb["users"]

    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        if not existing_user.get("active", True):
            # Reactivate user
            hashed_password = hash_password(user.password)

            token = create_access_token({"_id": str(existing_user["_id"])})

            await users_collection.update_one(
                {"email": user.email},
                {
                    "$set": {
                        "fname": user.fname,
                        "lname": user.lname,
                        "password": hashed_password,
                        "active": True,
                        "token": token,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            return JSONResponse(
                status_code=200,
                content={"status": True, "message": "Signup successful!", "data": token},
            )
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "User already exists!"},
        )

    # Create a new user
    hashed_password = hash_password(user.password)

    token = create_access_token({"email": user.email})

    new_user = {
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "password": hashed_password,
        "token": token,
        "active": user.active,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await users_collection.insert_one(new_user)
    return JSONResponse(
        status_code=201,
        content={"status": True, "message": "Signup successful!", "data": token},
    )


async def signin(user: UserSignin, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist. Please signup."},
        )

    # Verify password
    if not verify_password(user.password, existing_user["password"]):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Your details do not match!"},
        )

    # Generate token
    token = create_access_token({"_id": str(existing_user["_id"])})
    await users_collection.update_one(
        {"email": user.email},
        {"$set": {"token": token, "updated_at": datetime.now(timezone.utc)}},
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Signin successful!", "data": token},
    )
