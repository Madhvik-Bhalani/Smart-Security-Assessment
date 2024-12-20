from fastapi import APIRouter, Depends, Request
from Controllers.user_controller import signup, signin
from Models.user_model import UserSignup, UserSignin


router = APIRouter()


@router.post("/signup", tags=["User Signup"])
async def signup_route(user: UserSignup, request: Request):
    return await signup(user, request)


@router.post("/signin", tags=["User Signin"])
async def signin_route(user: UserSignin, request: Request):
    return await signin(user, request)
