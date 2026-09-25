import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Spending-Leak Agent API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database: Defaults to SQLite for immediate local testing, or PostgreSQL URL on Render/Supabase
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spendleak.db")
    
    # Supabase Auth
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-key-for-dev")
    
    # LLM (Gemini API)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Security / CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*"
    ]
    
    DEFAULT_CURRENCY: str = "INR"
    
    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
