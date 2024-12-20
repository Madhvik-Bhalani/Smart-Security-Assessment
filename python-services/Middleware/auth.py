from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Optional
import jwt
import os

# Load environment variables
TOKEN_SECRET_KEY = os.getenv("TOKEN_SECRET_KEY", "your_secret_key")


class Auth:
    @staticmethod
    async def verify_token(request: Request):
        token: Optional[str] = (
            request.headers.get("authorization")
            or request.query_params.get("token")
            or (await request.json()).get("token")
            if request.method in ["POST", "PUT"]
            else None
        )

        # Check if the token exists
        if not token:
            return JSONResponse(
                status_code=403,
                content={
                    "status": False,
                    "message": "A token is required for authentication!",
                },
            )

        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            # Decode the token
            decoded = jwt.decode(token, TOKEN_SECRET_KEY, algorithms=["HS256"])
            # Attach user information to the request object
            request.state.user = decoded
            return decoded
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401,
                content={"status": False, "message": "Token has expired!"},
            )
        except jwt.InvalidTokenError as e:
            return JSONResponse(
                status_code=401,
                content={"status": False, "message": "Invalid token!", "data": str(e)},
            )
