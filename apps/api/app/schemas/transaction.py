from datetime import date, datetime
from typing import Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class TransactionBase(BaseModel):
    transaction_date: date
    amount_minor: int
    currency_code: str = "INR"
    direction: Literal["debit", "credit"] = "debit"
    raw_description: str
    normalized_description: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_key: Optional[str] = None
    category: str = "Uncategorized"
    payment_rail: Optional[str] = None

class TransactionCreateManual(BaseModel):
    transaction_date: date
    amount: float = Field(..., gt=0, description="Amount in standard currency units (e.g. 499.00)")
    currency_code: str = "INR"
    direction: Literal["debit", "credit"] = "debit"
    raw_description: str
    category: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    account_id: Optional[str] = None
    import_id: Optional[str] = None
    transaction_date: date
    amount_minor: int
    amount_display: float
    currency_code: str
    direction: str
    raw_description: str
    normalized_description: str
    merchant_name: str
    merchant_key: str
    category: str
    payment_rail: Optional[str] = None
    is_duplicate: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ImportResponse(BaseModel):
    id: str
    filename: str
    status: str
    total_rows: int
    imported_rows: int
    duplicate_rows: int
    error_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
