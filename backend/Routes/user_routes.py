from fastapi import APIRouter, Depends, Request
from Controllers.user_controller import signup, signin, fetch_user, change_password, delete_account, edit_account
from Models.user_model import UserSignup, UserSignin, UserChangePassword, UserEditAccount, UserDeleteAccount
from Middleware.auth import Auth


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



# @router.post("/logout", tags=["User Logout"])
# async def logout_route(user: UserSignin, request: Request):
#     return await logout(user, request)