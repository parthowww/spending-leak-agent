from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata

from app.routers import auth, imports, transactions, recurring, cancellation, dashboard

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Spending-Leak Agent: Explainable Recurring Payment and Subscription Waste Intelligence Backend"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy development and cross-deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(imports.router)
app.include_router(transactions.router)
app.include_router(recurring.router)
app.include_router(cancellation.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
