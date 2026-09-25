from datetime import date, datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict

class CancellationMethod(BaseModel):
    channel: str  # web, app_store, google_play, email, phone
    title: str
    official_url: Optional[str] = None
    steps: List[str]

class CancellationGuideResponse(BaseModel):
    merchant_key: str
    merchant_name: str
    category: str
    official_url: Optional[str] = None
    methods: List[CancellationMethod]
    verification_tip: str
    email_support_available: bool = False
    support_email: Optional[str] = None

class CancellationCaseCreate(BaseModel):
    channel: str = "web"
    notes: Optional[str] = None
    reminder_date: Optional[date] = None

class CancellationCaseResponse(BaseModel):
    id: str
    user_id: str
    stream_id: str
    status: str
    cancellation_channel: str
    notes: Optional[str] = None
    reminder_date: Optional[date] = None
    submitted_at: Optional[datetime] = None
    verified_stopped_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmailDraftRequest(BaseModel):
    account_holder_name: str
    account_email_or_id: str
    reason: Optional[str] = "No longer using the service"

class EmailDraftResponse(BaseModel):
    subject: str
    body_text: str
