from datetime import date
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.ai_explainer import AIExplainer
from app.models.user import User
from app.models.recurring import RecurringStream
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    UpcomingCharge,
    CategorySpend
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])
ai_explainer = AIExplainer()

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    streams = (
        db.query(RecurringStream)
        .filter(
            RecurringStream.user_id == user.id,
            RecurringStream.user_status != "not_subscription"
        )
        .order_by(RecurringStream.predicted_next_charge_at.asc())
        .all()
    )

    total_monthly_minor = 0
    total_annual_minor = 0
    potential_savings_minor = 0
    review_queue_count = 0

    category_buckets = defaultdict(lambda: {"monthly": 0, "annual": 0, "count": 0})
    upcoming_list = []
    today = date.today()

    for s in streams:
        # Calculate monthly equivalent minor
        if s.frequency == "monthly":
            monthly_minor = s.amount_minor
        elif s.frequency == "quarterly":
            monthly_minor = int(round(s.amount_minor / 3.0))
        elif s.frequency == "annual":
            monthly_minor = int(round(s.amount_minor / 12.0))
        elif s.frequency == "weekly":
            monthly_minor = int(round(s.amount_minor * 4.33))
        elif s.frequency == "biweekly":
            monthly_minor = int(round(s.amount_minor * 2.16))
        else:
            monthly_minor = s.amount_minor

        annual_minor = s.annualized_cost_minor

        # If user has not marked it as 'keep', it is a potential leak candidate or under review
        if s.user_status in ["detected", "review", "cancel"]:
            review_queue_count += 1
            if s.stream_type in ["subscription", "membership"] or s.user_status in ["review", "cancel"]:
                potential_savings_minor += annual_minor

        # Active expenditure
        if s.user_status != "cancelled":
            total_monthly_minor += monthly_minor
            total_annual_minor += annual_minor

            # Category tally
            cat = s.category or "Other"
            category_buckets[cat]["monthly"] += monthly_minor
            category_buckets[cat]["annual"] += annual_minor
            category_buckets[cat]["count"] += 1

            # Upcoming charges
            days_due = (s.predicted_next_charge_at - today).days
            upcoming_list.append(
                UpcomingCharge(
                    stream_id=s.id,
                    merchant_name=s.merchant_name,
                    category=s.category,
                    amount_display=round(s.amount_minor / 100.0, 2),
                    currency_code=s.currency_code,
                    due_date=s.predicted_next_charge_at,
                    days_until_due=days_due,
                    frequency=s.frequency,
                    user_status=s.user_status
                )
            )

    # Sort upcoming by due date
    upcoming_list.sort(key=lambda x: x.due_date)

    categories_resp = [
        CategorySpend(
            category=cat,
            monthly_spend=round(data["monthly"] / 100.0, 2),
            annual_spend=round(data["annual"] / 100.0, 2),
            count=data["count"]
        )
        for cat, data in sorted(category_buckets.items(), key=lambda x: x[1]["monthly"], reverse=True)
    ]

    total_monthly = round(total_monthly_minor / 100.0, 2)
    total_annual = round(total_annual_minor / 100.0, 2)
    potential_savings = round(potential_savings_minor / 100.0, 2)

    # Generate AI spending overview briefing
    ai_summary = None
    if streams:
        ai_summary = await ai_explainer.summarize_spending(
            total_monthly=total_monthly,
            total_annual=total_annual,
            potential_savings=potential_savings,
            stream_count=len([s for s in streams if s.user_status != "cancelled"]),
            categories=[c.model_dump() for c in categories_resp],
            currency=user.default_currency
        )

    return DashboardSummaryResponse(
        currency_code=user.default_currency,
        total_monthly_spend=total_monthly,
        total_annual_spend=total_annual,
        total_recurring_count=len([s for s in streams if s.user_status != "cancelled"]),
        potential_annual_savings=potential_savings,
        review_queue_count=review_queue_count,
        upcoming_charges=upcoming_list[:8],
        category_breakdown=categories_resp,
        ai_summary=ai_summary
    )
