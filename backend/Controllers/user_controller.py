from Models.user_model import UserSignup, UserSignin, UserChangePassword, UserEditAccount, UserDeleteAccount, UserDeletePhoto, UserUploadPhoto, SubscriptionRequest, UserGetReports
from Services.auth_service import hash_password, verify_password, create_access_token
from datetime import datetime, timezone, timedelta
from fastapi.responses import JSONResponse, RedirectResponse

from fastapi import Request, HTTPException, UploadFile, File, Form
from utility.utils import to_serializable
from bson import ObjectId, Binary

import stripe
import os
import asyncio
import base64


stripe.api_key = os.getenv("STRIPE_KEY")



async def signup(user: UserSignup, request: Request):
    users_collection = request.app.mongodb["users"]

    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        if not existing_user.get("active", True):
            # Reactivate user
            hashed_password = hash_password(user.password)

            token = create_access_token({"_id": str(existing_user["_id"])})
            hashed_password = hash_password(user.password)
            

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
    subscription_duration = timedelta(days=14)
    expiration_date = (datetime.now(timezone.utc) + subscription_duration).isoformat()

    new_user = {
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "password": hashed_password,
        "subscription": f"14 day free trial|expires:{expiration_date}",
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
    update_fields = {}
    if user.fname:
        update_fields["fname"] = user.fname
        update_fields["updated_at"] = datetime.now(timezone.utc)

    if user.lname:
        update_fields["lname"] = user.lname
        update_fields["updated_at"] = datetime.now(timezone.utc)

        
        
    await users_collection.update_one(
        {"email": user.email},
        {"$set": update_fields}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Account updated successfully!"},
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

async def upload_profile_photo(user: UserUploadPhoto, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Update profile photo URL
    await users_collection.update_one(
        {"email": user.email},
        {"$set": {"profile_photo_url": user.profile_photo_url, "updated_at": datetime.now(timezone.utc)}}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Profile photo uploaded successfully!"},
    )


async def delete_profile_photo(user: UserDeletePhoto, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Remove profile photo URL
    await users_collection.update_one(
        {"email": user.email},
        {"$unset": {"profile_photo_url": ""}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )
    return JSONResponse(
        status_code=200,
        content={"status": True, "message": "Profile photo deleted successfully!"},
    )


async def upload_report(email: str, file_name: str, base64_file: str, request: Request):
    users_collection = request.app.mongodb["users"]

    # Find user by email
    existing_user = await users_collection.find_one({"email": email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    try:
        # Extract and decode the base64 content
        if base64_file.startswith("data:application/pdf;base64,"):
            base64_file = base64_file.split("base64,")[1]  # Remove the header

        #pdf_data = base64.b64decode(base64_file)  # Convert base64 to binary

        # Store the report in MongoDB
        report_data = {
            "file_name": file_name,
            "uploaded_at": datetime.now(timezone.utc),
            "file_data": base64_file  # Store as BSON Binary
        }

        await users_collection.update_one(
            {"email": email},
            {"$push": {"reports": report_data}, "$set": {"updated_at": datetime.now(timezone.utc)}}
        )

        return JSONResponse(
            status_code=200,
            content={"status": True, "message": "Report uploaded successfully!"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": False, "message": f"Failed to process the file: {str(e)}"}
        )


async def get_reports(user: UserGetReports, request: Request):
    users_collection = request.app.mongodb["users"]

    # Extract email correctly
    email = user.email  # Get email string from model

    # Find the user by email
    existing_user = await users_collection.find_one({"email": email})
    if not existing_user or not existing_user.get("active", True):
        return JSONResponse(
            status_code=400,
            content={"status": False, "message": "Account does not exist."},
        )

    # Retrieve all reports
    reports = existing_user.get("reports", [])

    if not reports:
        return JSONResponse(
            status_code=404,
            content={"status": False, "message": "No reports found for this user."},
        )

    # Convert each report's file_data (Binary) to a properly formatted Base64-encoded string
    formatted_reports = []
    for report in reports:
        try:
            # Check if 'file_data' exists and is in binary format
            if "file_data" in report and isinstance(report["file_data"], (bytes, bytearray)):  
                base64_file_data = base64.b64encode(report["file_data"]).decode("utf-8")  # Convert binary to Base64
                formatted_file_data = f"data:application/pdf;base64,{base64_file_data}"  # Correct format
            else:
                formatted_file_data = None  # Handle missing or incorrect file data

            formatted_reports.append({
                "file_name": report["file_name"],
                "uploaded_at": report["uploaded_at"].isoformat(),  # Convert datetime to string
                "file_data": f"data:application/pdf;base64,{report['file_data']}"  # Now properly formatted
            })
        except Exception as e:
            print(f"Error encoding file {report['file_name']}: {e}")

    return JSONResponse(
        status_code=200,
        content={"status": True, "reports": formatted_reports}
    )