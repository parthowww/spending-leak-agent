from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.cancellation_directory import get_cancellation_guide
from app.services.ai_explainer import AIExplainer
from app.models.user import User
from app.models.recurring import RecurringStream
from app.models.cancellation import CancellationCase
from app.schemas.cancellation import (
    CancellationGuideResponse,
    CancellationCaseCreate,
    CancellationCaseResponse,
    EmailDraftRequest,
    EmailDraftResponse
)

router = APIRouter(prefix="/api/v1/cancellation", tags=["cancellation"])
ai_explainer = AIExplainer()

@router.get("/guide/{stream_id}", response_model=CancellationGuideResponse)
def get_stream_cancellation_guide(
    stream_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")

    guide = get_cancellation_guide(stream.merchant_key, stream.merchant_name, stream.category)
    return CancellationGuideResponse(**guide)


@router.post("/case/{stream_id}", response_model=CancellationCaseResponse)
def record_cancellation_progress(
    stream_id: str,
    payload: CancellationCaseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records the user's progress through a cancellation flow:
    - User marks 'submitted cancellation' externally.
    - Sets a reminder before the next renewal cycle.
    - Updates stream status to 'cancelled'.
    """
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")

    case = db.query(CancellationCase).filter(CancellationCase.stream_id == stream_id, CancellationCase.user_id == user.id).first()
    if not case:
        case = CancellationCase(
            user_id=user.id,
            stream_id=stream.id,
            status="submitted",
            cancellation_channel=payload.channel,
            notes=payload.notes,
            reminder_date=payload.reminder_date,
            submitted_at=datetime.utcnow()
        )
        db.add(case)
    else:
        case.status = "submitted"
        case.cancellation_channel = payload.channel
        case.notes = payload.notes
        case.reminder_date = payload.reminder_date
        case.submitted_at = datetime.utcnow()

    # Update recurring stream status
    stream.user_status = "cancelled"
    if payload.reminder_date:
        stream.reminder_date = payload.reminder_date

    db.commit()
    db.refresh(case)
    return case


@router.post("/draft-email/{stream_id}", response_model=EmailDraftResponse)
async def draft_email(
    stream_id: str,
    payload: EmailDraftRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a formal, tailored cancellation email draft."""
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")

    result = await ai_explainer.draft_cancellation_email(
        merchant_name=stream.merchant_name,
        customer_name=payload.account_holder_name or user.full_name or "Subscriber",
        account_email_or_id=payload.account_email_or_id,
        reason=payload.reason or "No longer needed"
    )

    return EmailDraftResponse(
        subject=result.get("subject", f"Cancellation Request - {stream.merchant_name}"),
        body_text=result.get("body_text", "")
    )
