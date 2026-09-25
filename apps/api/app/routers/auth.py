from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Returns the authenticated user identity and settings."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "default_currency": user.default_currency,
        "created_at": user.created_at,
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY)
    }

@router.get("/config")
def get_auth_config():
    """Returns public auth configuration for frontend Supabase client initialization."""
    return {
        "supabase_url": settings.SUPABASE_URL,
        "supabase_anon_key": settings.SUPABASE_ANON_KEY,
        "environment": settings.ENVIRONMENT
    }
