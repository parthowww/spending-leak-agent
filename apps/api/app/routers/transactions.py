from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.merchant_normalizer import normalize_merchant, clean_description
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse, TransactionCreateManual
from app.routers.imports import run_detection_pipeline_for_user

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    category: Optional[str] = None,
    direction: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == user.id)

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.raw_description.ilike(s_term)) |
            (Transaction.merchant_name.ilike(s_term)) |
            (Transaction.normalized_description.ilike(s_term))
        )
    if category and category != "All":
        query = query.filter(Transaction.category == category)
    if direction and direction in ["debit", "credit"]:
        query = query.filter(Transaction.direction == direction)

    offset = (page - 1) * limit
    txns = query.order_by(Transaction.transaction_date.desc()).offset(offset).limit(limit).all()

    return [
        TransactionResponse(
            id=t.id,
            user_id=t.user_id,
            account_id=t.account_id,
            import_id=t.import_id,
            transaction_date=t.transaction_date,
            amount_minor=t.amount_minor,
            amount_display=round(t.amount_minor / 100.0, 2),
            currency_code=t.currency_code,
            direction=t.direction,
            raw_description=t.raw_description,
            normalized_description=t.normalized_description,
            merchant_name=t.merchant_name,
            merchant_key=t.merchant_key,
            category=t.category,
            payment_rail=t.payment_rail,
            is_duplicate=t.is_duplicate,
            created_at=t.created_at
        )
        for t in txns
    ]

@router.post("/manual", response_model=TransactionResponse)
def create_manual_transaction(
    data: TransactionCreateManual,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    amount_minor = int(round(data.amount * 100))
    clean_desc = clean_description(data.raw_description)
    m_name, m_key, default_cat, _ = normalize_merchant(data.raw_description)
    cat = data.category or default_cat
    
    fp = f"{user.id}|{data.transaction_date.isoformat()}|{amount_minor}|{clean_desc.lower()}"

    txn = Transaction(
        user_id=user.id,
        transaction_date=data.transaction_date,
        amount_minor=amount_minor,
        currency_code=data.currency_code,
        direction=data.direction,
        raw_description=data.raw_description,
        normalized_description=clean_desc,
        merchant_name=m_name,
        merchant_key=m_key,
        category=cat,
        payment_rail="Manual Entry",
        fingerprint=fp,
        is_duplicate=False
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # Re-run detection pipeline
    run_detection_pipeline_for_user(user.id, db)

    return TransactionResponse(
        id=txn.id,
        user_id=txn.user_id,
        account_id=txn.account_id,
        import_id=txn.import_id,
        transaction_date=txn.transaction_date,
        amount_minor=txn.amount_minor,
        amount_display=round(txn.amount_minor / 100.0, 2),
        currency_code=txn.currency_code,
        direction=txn.direction,
        raw_description=txn.raw_description,
        normalized_description=txn.normalized_description,
        merchant_name=txn.merchant_name,
        merchant_key=txn.merchant_key,
        category=txn.category,
        payment_rail=txn.payment_rail,
        is_duplicate=txn.is_duplicate,
        created_at=txn.created_at
    )

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(txn)
    db.commit()
    
    # Recalculate detection
    run_detection_pipeline_for_user(user.id, db)
    return {"status": "success", "message": "Transaction deleted"}
