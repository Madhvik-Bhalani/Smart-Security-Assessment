from Models.user_model import UserSignup, UserSignin, UserChangePassword, UserEditAccount, UserDeleteAccount
from Services.auth_service import hash_password, verify_password, create_access_token
from datetime import datetime, timezone
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi import Request
from Utility.utils import to_serializable
from bson import ObjectId


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
                content={
                    "status": True,
                    "message": "Signup successful!",
                    "data": token,
                },
            )
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "User already exists!"},
        )

    # Create a new user
    hashed_password = hash_password(user.password)

    new_user = {
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "password": hashed_password,
        "active": user.active,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    insert_result = await users_collection.insert_one(new_user)

    inserted_id = insert_result.inserted_id

    token = create_access_token({"_id": str(inserted_id)})

    await users_collection.update_one(
        {"_id": inserted_id},
        {"$set": {"token": token, "updated_at": datetime.now(timezone.utc)}},
    )
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
            content={
                "status": False,
                "message": "Account does not exist. Please signup.",
            },
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


async def fetch_user(user: dict, request: Request):

    users_collection = request.app.mongodb["users"]

    # Get user ID from decoded token
    user_id = user.get("_id")

    try:
        # Query the database using the ObjectId
        user_data = await users_collection.find_one({"_id": ObjectId(user_id)})

        if user_data:
            # Convert MongoDB document to JSON-serializable format
            json_data = to_serializable(user_data)
            return JSONResponse(
                status_code=200,
                content={"status": True, "data": json_data},
            )

        return JSONResponse(
            status_code=404, content={"status": False, "message": "User not found!"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": False,
                "message": "Error fetching user data!",
                "error": str(e),
            },
        )

# Change Password
async def change_password(user: UserChangePassword, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Verify old password
    if not verify_password(user.old_password, existing_user["password"]):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Old password is incorrect."},
        )

    # Update password
    hashed_password = hash_password(user.new_password)
    await users_collection.update_one(
        {"email": user.email},
        {"$set": {"password": hashed_password, "updated_at": datetime.now(timezone.utc)}}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Password changed successfully!"},
    )



    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Verify password
    if not verify_password(user.password, existing_user["password"]):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Your details do not match!"},
        )

    # Soft delete account
    await users_collection.update_one(
        {"email": user.email},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Account deleted successfully!"},
    )

# Edit Account
async def edit_account(user: UserEditAccount, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Update user details
    update_fields = {"updated_at": datetime.now(timezone.utc)}
    if user.fname:
        update_fields["fname"] = user.fname
    if user.lname:
        update_fields["lname"] = user.lname
    await users_collection.update_one(
        {"email": user.email},
        {"$set": update_fields}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Account updated successfully!"},
    )

# Log Out
async def logout(user: UserSignin, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Verify password
    if not verify_password(user.password, existing_user["password"]):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Your details do not match!"},
        )

    # Invalidate token
    await users_collection.update_one(
        {"email": user.email},
        {"$unset": {"token": ""}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Logged out successfully!"},
)


async def delete_account(user: UserDeleteAccount, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Soft delete account (mark as inactive)
    await users_collection.delete_one(
        {"email": user.email},
        # {"$set": {"active": False, "updated_at": datetime.now(timezone.utc)}}
    )

    # Redirect to the homepage after successful deletion
    return RedirectResponse(url="/", status_code=302)
