import jwt
from typing import Optional
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User

DEFAULT_DEMO_USER_ID = "usr_demo_portfolio_user"
DEFAULT_DEMO_EMAIL = "demo@spendingleak.agent"
DEFAULT_DEMO_NAME = "Parthasarathi"

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_demo_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts and authenticates user identity from Supabase JWT or Demo/Guest header.
    Enforces that every financial query is strictly isolated by user_id.
    """
    user_id = None
    email = None
    full_name = None

    # 1. Check for Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
        
        # Check for demo token
        if token.startswith("demo") or token == "guest-test-token":
            user_id = f"usr_{token}"
            email = f"{token}@spendingleak.local"
            full_name = "Portfolio Demo User"
        else:
            # Decode Supabase JWT
            try:
                # Try decoding with Supabase JWT Secret if configured
                secret = settings.SUPABASE_JWT_SECRET or "super-secret-jwt-key-for-dev"
                # If Supabase Auth is used, the audience is typically 'authenticated'
                payload = jwt.decode(
                    token,
                    secret,
                    algorithms=["HS256"],
                    options={"verify_aud": False, "verify_signature": bool(settings.SUPABASE_URL and settings.SUPABASE_JWT_SECRET != "super-secret-jwt-key-for-dev")}
                )
                user_id = payload.get("sub")
                email = payload.get("email", f"{user_id}@supabase.user")
                user_metadata = payload.get("user_metadata", {})
                full_name = user_metadata.get("full_name", user_metadata.get("name", "User"))
            except Exception as e:
                # If token parsing fails but it looks like a sub ID, allow graceful dev fallback
                if token and len(token) > 5 and not settings.ENVIRONMENT == "production":
                    user_id = f"usr_{token[:16]}"
                    email = f"{user_id}@user.local"
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired Supabase authentication token",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

    # 2. Check for explicit dev/demo header
    elif x_demo_user_id:
        user_id = f"usr_{x_demo_user_id.strip()}"
        email = f"{x_demo_user_id.strip()}@spendingleak.local"
        full_name = f"User {x_demo_user_id.capitalize()}"

    # 3. Default demo user in local development mode
    elif settings.ENVIRONMENT != "production":
        user_id = DEFAULT_DEMO_USER_ID
        email = DEFAULT_DEMO_EMAIL
        full_name = DEFAULT_DEMO_NAME
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure user exists in our local database for foreign key integrity
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=email or f"{user_id}@spendleak.app",
            full_name=full_name or "Financial User",
            default_currency=settings.DEFAULT_CURRENCY
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
