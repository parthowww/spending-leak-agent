import json
from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.ai_explainer import AIExplainer
from app.models.user import User
from app.models.recurring import RecurringStream, RecurringStreamTransaction
from app.models.transaction import Transaction
from app.schemas.recurring import (
    RecurringStreamResponse,
    DecisionRequest,
    StreamTransactionEvidence
)
from app.routers.imports import run_detection_pipeline_for_user

router = APIRouter(prefix="/api/v1/recurring-streams", tags=["recurring-streams"])
ai_explainer = AIExplainer()

def build_stream_response(s: RecurringStream, db: Session, include_txns: bool = True) -> RecurringStreamResponse:
    evidence_dict = {}
    try:
        evidence_dict = json.loads(s.evidence_json) if s.evidence_json else {}
    except Exception:
        evidence_dict = {}

    txns_evidence = []
    if include_txns:
        links = (
            db.query(Transaction)
            .join(RecurringStreamTransaction, RecurringStreamTransaction.transaction_id == Transaction.id)
            .filter(RecurringStreamTransaction.stream_id == s.id)
            .order_by(Transaction.transaction_date.desc())
            .all()
        )
        txns_evidence = [
            StreamTransactionEvidence(
                id=t.id,
                transaction_date=t.transaction_date,
                amount_display=round(t.amount_minor / 100.0, 2),
                raw_description=t.raw_description,
                currency_code=t.currency_code
            )
            for t in links
        ]

    return RecurringStreamResponse(
        id=s.id,
        user_id=s.user_id,
        merchant_name=s.merchant_name,
        merchant_key=s.merchant_key,
        category=s.category,
        stream_type=s.stream_type,
        frequency=s.frequency,
        expected_interval_days=s.expected_interval_days,
        amount_minor=s.amount_minor,
        amount_display=round(s.amount_minor / 100.0, 2),
        min_amount_display=round(s.min_amount_minor / 100.0, 2),
        max_amount_display=round(s.max_amount_minor / 100.0, 2),
        currency_code=s.currency_code,
        first_seen_at=s.first_seen_at,
        last_seen_at=s.last_seen_at,
        predicted_next_charge_at=s.predicted_next_charge_at,
        occurrence_count=s.occurrence_count,
        confidence_score=s.confidence_score,
        leak_score=s.leak_score,
        annualized_cost_minor=s.annualized_cost_minor,
        annualized_cost_display=round(s.annualized_cost_minor / 100.0, 2),
        user_status=s.user_status,
        detection_reason=s.detection_reason,
        evidence=evidence_dict,
        reminder_date=s.reminder_date,
        cancellation_notes=s.cancellation_notes,
        created_at=s.created_at,
        updated_at=s.updated_at,
        transactions=txns_evidence
    )


@router.get("", response_model=List[RecurringStreamResponse])
def list_recurring_streams(
    status: Optional[str] = Query(None, description="detected, keep, review, cancel, not_subscription, remind_later"),
    category: Optional[str] = None,
    min_confidence: Optional[float] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(RecurringStream).filter(RecurringStream.user_id == user.id)

    if status and status != "all":
        query = query.filter(RecurringStream.user_status == status)
    if category and category != "All":
        query = query.filter(RecurringStream.category == category)
    if min_confidence is not None:
        query = query.filter(RecurringStream.confidence_score >= min_confidence)

    # Sort by leak_score descending
    streams = query.order_by(RecurringStream.leak_score.desc()).all()
    return [build_stream_response(s, db, include_txns=False) for s in streams]


@router.get("/{stream_id}", response_model=RecurringStreamResponse)
def get_recurring_stream_detail(
    stream_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")
    return build_stream_response(stream, db, include_txns=True)


@router.post("/{stream_id}/decision", response_model=RecurringStreamResponse)
def submit_stream_decision(
    stream_id: str,
    payload: DecisionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records the user action:
    - 'keep': Confirmed intentional expense
    - 'review' or 'cancel': Flagged for cancellation navigation
    - 'not_subscription': Marked as non-recurring false positive
    - 'remind_later': Snooze review with reminder date
    """
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")

    stream.user_status = payload.action
    if payload.reminder_date:
        stream.reminder_date = payload.reminder_date
    if payload.notes:
        stream.cancellation_notes = payload.notes

    db.commit()
    db.refresh(stream)
    return build_stream_response(stream, db, include_txns=True)


@router.post("/{stream_id}/ai-explanation")
async def get_ai_explanation(
    stream_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an AI natural-language explanation of why this payment is considered a potential leak."""
    stream = db.query(RecurringStream).filter(RecurringStream.id == stream_id, RecurringStream.user_id == user.id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Recurring stream not found")

    explanation = await ai_explainer.explain_stream({
        "merchant_name": stream.merchant_name,
        "frequency": stream.frequency,
        "occurrence_count": stream.occurrence_count,
        "amount_minor": stream.amount_minor,
        "annualized_cost_minor": stream.annualized_cost_minor,
        "currency_code": stream.currency_code,
        "category": stream.category,
        "confidence_score": stream.confidence_score
    })
    return {"explanation": explanation}


@router.post("/refresh")
def refresh_detection(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-runs the detection algorithm across all user transactions."""
    run_detection_pipeline_for_user(user.id, db)
    return {"status": "success", "message": "Recurrence detection refreshed."}
