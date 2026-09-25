from datetime import date, datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict

class DecisionRequest(BaseModel):
    action: Literal["keep", "review", "cancel", "not_subscription", "remind_later"]
    reminder_date: Optional[date] = None
    notes: Optional[str] = None

class StreamTransactionEvidence(BaseModel):
    id: str
    transaction_date: date
    amount_display: float
    raw_description: str
    currency_code: str

class RecurringStreamResponse(BaseModel):
    id: str
    user_id: str
    merchant_name: str
    merchant_key: str
    category: str
    stream_type: str
    frequency: str
    expected_interval_days: float
    amount_minor: int
    amount_display: float
    min_amount_display: float
    max_amount_display: float
    currency_code: str
    first_seen_at: date
    last_seen_at: date
    predicted_next_charge_at: date
    occurrence_count: int
    confidence_score: float
    leak_score: float
    annualized_cost_minor: int
    annualized_cost_display: float
    user_status: str
    detection_reason: str
    evidence: Dict[str, Any]
    reminder_date: Optional[date] = None
    cancellation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    transactions: Optional[List[StreamTransactionEvidence]] = None

    model_config = ConfigDict(from_attributes=True)
