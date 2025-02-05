from fastapi import APIRouter, Depends, Request, HTTPException
from Controllers.user_controller import signup, signin, fetch_user, change_password, delete_account, edit_account, delete_profile_photo, upload_profile_photo, get_reports,upload_report
from Models.user_model import UserSignup, UserSignin, UserChangePassword, UserEditAccount, UserDeleteAccount, UserUploadPhoto, UserDeletePhoto, SubscriptionRequest,UserUploadReport,UserGetReports
from datetime import timedelta, timezone, datetime
from Middleware.auth import Auth
import stripe
import os

stripe.api_key = os.getenv("STRIPE_KEY")

router = APIRouter()


@router.post("/signup", tags=["User"])
async def signup_route(user: UserSignup, request: Request):
    return await signup(user, request)


@router.post("/signin", tags=["User"])
async def signin_route(user: UserSignin, request: Request):
    return await signin(user, request)


@router.get("/fetch-user", tags=["User"])
async def fetch_user_route(request: Request, user=Depends(Auth.verify_token)):
    return await fetch_user(user, request)


@router.post("/change-password", tags=["User"])
async def change_password_route(user: UserChangePassword, request: Request):
    return await change_password(user, request)

@router.post("/edit-account", tags=["User"])
async def edit_account_route(user: UserEditAccount, request: Request):
    return await edit_account(user, request)

@router.post("/delete-account", tags=["User"])
async def delete_account_route(user: UserDeleteAccount, request: Request):
    return await delete_account(user, request)


@router.post("/upload-profile-photo", tags=["User Profile Photo"])
async def upload_profile_photo_route(user: UserUploadPhoto, request: Request):
    return await upload_profile_photo(user, request)


@router.post("/delete-profile-photo", tags=["User Profile Photo"])
async def delete_profile_photo_route(user: UserDeletePhoto, request: Request):
    return await delete_profile_photo(user, request)

plans = [
    {
        "plan_id": "price_1QmQ6KAtVagDsvFAJJ83EgBY",
        "plan_name": "monthly",
        "duration": "month"
    },
    {
        "plan_id": "price_1QmQ6hAtVagDsvFAkYSiehHV",
        "plan_name": "6 month",
        "duration": "6 month"
    },
    {
        "plan_id": "price_1QmKQ9AtVagDsvFAVkBMewMV",
        "plan_name": "yearly",
        "duration": "year"
    }
]

@router.post("/create-subscription")
async def create_subscription(user: SubscriptionRequest, request: Request):
    # Find the plan based on name and duration
    plan = next((p for p in plans if p["plan_name"] == user.plan_name and p["duration"] == user.duration), None)
    users_collection = request.app.mongodb["users"]

    if not plan:
        raise HTTPException(status_code=400, detail="Plan not found")

    try:
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            mode='subscription',
            payment_method_types=['card'],
            line_items=[
                {
                    "price": plan["plan_id"],
                    "quantity": 1,
                }
            ],
            success_url="http://localhost:3000/success/?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/fail",
            customer_email= user.email
        )
        if plan['duration'] == "month":
            subscription_duration = timedelta(days=30)
            how_month = "monthly plan"
        elif plan['duration'] == "6 month":
            subscription_duration = timedelta(days=180)
            how_month = "6 month plan"
        elif plan['duration'] == "year":
            subscription_duration = timedelta(days=365)
            how_month = "1 year plan"

        expiration_date = (datetime.now(timezone.utc) + subscription_duration).isoformat()

        await users_collection.update_one(
        {"email": user.email},
        {"$set": {"subscription": f"Current plan: {how_month}|expires:{expiration_date}", "updated_at": datetime.now(timezone.utc)}}
    )
    

        return {"session": session}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to create subscription")


@router.post("/upload-report", tags=["User Reports"])
async def upload_report_route(report: UserUploadReport, request: Request):
    return await upload_report(report.email, report.file_name, report.base64_file, request)


@router.post("/get-reports", tags=["User Reports"])
async def get_reports_route(user: UserGetReports, request: Request):
    return await get_reports(user, request)

# @router.post("/logout", tags=["User Logout"])
# async def logout_route(user: UserSignin, request: Request):
#     return await logout(user, request)