from fastapi import APIRouter, Depends, Request
from Controllers.user_controller import signup, signin, fetch_user
from Models.user_model import UserSignup, UserSignin
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
