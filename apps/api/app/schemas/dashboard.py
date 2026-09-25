from datetime import date
from typing import List, Optional
from pydantic import BaseModel

class UpcomingCharge(BaseModel):
    stream_id: str
    merchant_name: str
    category: str
    amount_display: float
    currency_code: str
    due_date: date
    days_until_due: int
    frequency: str
    user_status: str

class CategorySpend(BaseModel):
    category: str
    monthly_spend: float
    annual_spend: float
    count: int

class DashboardSummaryResponse(BaseModel):
    currency_code: str
    total_monthly_spend: float
    total_annual_spend: float
    total_recurring_count: int
    potential_annual_savings: float
    review_queue_count: int
    upcoming_charges: List[UpcomingCharge]
    category_breakdown: List[CategorySpend]
    ai_summary: Optional[str] = None
