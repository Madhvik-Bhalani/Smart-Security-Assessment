from fastapi import Request, HTTPException
import jwt
import os

# Load environment variables
TOKEN_SECRET_KEY = os.getenv("TOKEN_SECRET_KEY", "your_secret_key")


class Auth:
    @staticmethod
    async def verify_token(request: Request):
        # Normalize headers to lowercase
        headers = {key.lower(): value for key, value in request.headers.items()}

        # Normalize query parameters to lowercase
        query_params = {
            key.lower(): value for key, value in request.query_params.items()
        }

        # Look for token in headers or query parameters
        token = (
            headers.get("authorization")
            or headers.get("token")
            or query_params.get("authorization")
            or query_params.get("token")
        )

        # Check if the token exists
        if not token:
            raise HTTPException(
                status_code=403,
                detail="A token is required for authentication!",
            )
        
        try:
            # Decode the token
            decoded = jwt.decode(token, TOKEN_SECRET_KEY, algorithms=["HS256"])
            # Attach user information to the request object
            request.state.user = decoded
            return decoded
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired!",
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token! Error: {str(e)}",
            )
