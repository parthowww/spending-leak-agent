import os
import json
from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.csv_parser import CSVTransactionParser
from app.services.recurrence_detector import RecurrenceDetector
from app.models.user import User
from app.models.transaction import Transaction, ImportBatch, FinancialAccount
from app.models.recurring import RecurringStream, RecurringStreamTransaction
from app.models.cancellation import CancellationCase

router = APIRouter(prefix="/api/v1/imports", tags=["imports"])

def run_detection_pipeline_for_user(user_id: str, db: Session):
    """
    Executes the deterministic recurrence detection pipeline across all active transactions
    for this isolated user, syncing RecurringStream records and transaction linkages.
    """
    user_txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.direction == "debit", Transaction.is_duplicate == False)
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    if not user_txns:
        return

    # Convert to dicts for detector
    txn_dicts = [
        {
            "id": t.id,
            "transaction_date": t.transaction_date,
            "amount_minor": t.amount_minor,
            "currency_code": t.currency_code,
            "direction": t.direction,
            "raw_description": t.raw_description,
            "merchant_name": t.merchant_name,
            "merchant_key": t.merchant_key,
            "category": t.category,
            "is_duplicate": t.is_duplicate,
        }
        for t in user_txns
    ]

    detector = RecurrenceDetector(as_of_date=date.today())
    detected_list = detector.detect_streams(txn_dicts)

    # Existing streams for this user
    existing_streams = db.query(RecurringStream).filter(RecurringStream.user_id == user_id).all()
    existing_map = {s.merchant_key: s for s in existing_streams}

    for item in detected_list:
        m_key = item["merchant_key"]
        stream = existing_map.get(m_key)

        evidence_str = json.dumps(item["evidence"], default=str)

        if not stream:
            stream = RecurringStream(
                user_id=user_id,
                merchant_name=item["merchant_name"],
                merchant_key=m_key,
                category=item["category"],
                stream_type=item["stream_type"],
                frequency=item["frequency"],
                expected_interval_days=item["expected_interval_days"],
                amount_minor=item["amount_minor"],
                min_amount_minor=item["min_amount_minor"],
                max_amount_minor=item["max_amount_minor"],
                currency_code=item["currency_code"],
                first_seen_at=item["first_seen_at"],
                last_seen_at=item["last_seen_at"],
                predicted_next_charge_at=item["predicted_next_charge_at"],
                occurrence_count=item["occurrence_count"],
                confidence_score=item["confidence_score"],
                leak_score=item["leak_score"],
                annualized_cost_minor=item["annualized_cost_minor"],
                user_status="detected",
                detection_reason=item["detection_reason"],
                evidence_json=evidence_str
            )
            db.add(stream)
            db.flush()
        else:
            # Preserve user decision status if user already interacted
            stream.category = item["category"]
            stream.frequency = item["frequency"]
            stream.expected_interval_days = item["expected_interval_days"]
            stream.amount_minor = item["amount_minor"]
            stream.min_amount_minor = item["min_amount_minor"]
            stream.max_amount_minor = item["max_amount_minor"]
            stream.first_seen_at = item["first_seen_at"]
            stream.last_seen_at = item["last_seen_at"]
            stream.predicted_next_charge_at = item["predicted_next_charge_at"]
            stream.occurrence_count = item["occurrence_count"]
            stream.confidence_score = item["confidence_score"]
            stream.leak_score = item["leak_score"]
            stream.annualized_cost_minor = item["annualized_cost_minor"]
            stream.detection_reason = item["detection_reason"]
            stream.evidence_json = evidence_str

        # Re-link transactions
        db.query(RecurringStreamTransaction).filter(RecurringStreamTransaction.stream_id == stream.id).delete()
        for t_data in item["transactions"]:
            if t_data.get("id"):
                link = RecurringStreamTransaction(stream_id=stream.id, transaction_id=t_data["id"])
                db.add(link)

    db.commit()


@router.post("/csv")
async def upload_csv(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Receives and parses uploaded CSV statement file.
    Normalizes rows, filters duplicates, stores transactions, and executes recurrence detection.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV text files are supported.")

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8-sig")  # handles potential UTF-8 BOM
    except UnicodeDecodeError:
        try:
            content_str = content_bytes.decode("latin1")
        except Exception:
            raise HTTPException(status_code=400, detail="Could not decode CSV text file encoding.")

    # Fetch existing transaction fingerprints for user-level deduplication
    existing_fps = set(
        r[0] for r in db.query(Transaction.fingerprint).filter(Transaction.user_id == user.id).all()
    )

    parser = CSVTransactionParser(user_id=user.id, default_currency=user.default_currency)
    result = parser.parse_csv_content(content_str, existing_fingerprints=existing_fps)
    stats = result["stats"]
    parsed_txns = result["transactions"]

    # Record import batch
    batch = ImportBatch(
        user_id=user.id,
        filename=file.filename,
        file_size_bytes=len(content_bytes),
        status="completed" if parsed_txns else "failed",
        total_rows=stats["total_rows"],
        imported_rows=stats["imported_rows"],
        duplicate_rows=stats["duplicate_rows"],
        error_message=None if parsed_txns else "No valid transaction rows found"
    )
    db.add(batch)
    db.flush()

    # Store transaction entities
    for t in parsed_txns:
        txn_record = Transaction(
            user_id=user.id,
            import_id=batch.id,
            transaction_date=t["transaction_date"],
            amount_minor=t["amount_minor"],
            currency_code=t["currency_code"],
            direction=t["direction"],
            raw_description=t["raw_description"],
            normalized_description=t["normalized_description"],
            merchant_name=t["merchant_name"],
            merchant_key=t["merchant_key"],
            category=t["category"],
            payment_rail=t["payment_rail"],
            fingerprint=t["fingerprint"],
            is_duplicate=t["is_duplicate"],
            metadata_json=t["metadata_json"]
        )
        db.add(txn_record)

    db.commit()

    # Run recurrence detector
    if parsed_txns:
        run_detection_pipeline_for_user(user.id, db)

    return {
        "import_id": batch.id,
        "filename": file.filename,
        "status": batch.status,
        "total_rows": stats["total_rows"],
        "imported_rows": stats["imported_rows"],
        "duplicate_rows": stats["duplicate_rows"],
        "error_rows": stats["errors"],
        "message": f"Successfully parsed {stats['imported_rows']} transactions. {stats['duplicate_rows']} duplicates skipped."
    }


@router.post("/load-demo")
def load_demo_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Seeds a rich, realistic 6-month transaction dataset matching the portfolio demo scenario:
    - Netflix ₹499/mo (Streaming)
    - Spotify ₹119/mo (Streaming)
    - Adobe Creative Cloud ₹1,675/mo (Software SaaS)
    - OpenAI ChatGPT Plus ₹1,999/mo (Software SaaS)
    - Google One ₹130/mo (Cloud Storage)
    - BESCOM Electricity Bill ₹1,350 - ₹1,580/mo (Variable Utility)
    - Cult.fit Cultpass ₹1,499/quarter (Fitness)
    - House Rent ₹22,000/mo (Housing)
    - Random non-recurring Amazon and dining purchases to test precision.
    """
    # Clear user's previous data for a fresh clean demo state
    db.query(RecurringStreamTransaction).filter(
        RecurringStreamTransaction.stream_id.in_(
            db.query(RecurringStream.id).filter(RecurringStream.user_id == user.id)
        )
    ).delete(synchronize_session=False)
    db.query(CancellationCase).filter(CancellationCase.user_id == user.id).delete()
    db.query(RecurringStream).filter(RecurringStream.user_id == user.id).delete()
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(ImportBatch).filter(ImportBatch.user_id == user.id).delete()
    db.commit()

    today = date.today()
    demo_data = []

    # 1. Netflix: ₹499 monthly on ~15th
    for m in range(6, 0, -1):
        d = today - timedelta(days=m * 30 + 2)
        demo_data.append((d, 49900, "UPI/NETFLIX/paytm-4128@paytm/2026", "Netflix", "netflix", "Streaming & Entertainment", "subscription"))

    # 2. Spotify: ₹119 monthly on ~5th
    for m in range(6, 0, -1):
        d = today - timedelta(days=m * 30 + 12)
        demo_data.append((d, 11900, "TST* SPOTIFY AB MUMBAI IN", "Spotify", "spotify", "Streaming & Entertainment", "subscription"))

    # 3. Adobe: ₹1,675 monthly on ~22nd
    for m in range(6, 0, -1):
        d = today - timedelta(days=m * 30 - 4)
        demo_data.append((d, 167500, "ADOBE SYSTEMS INDIA PVT LTD BANGALORE", "Adobe Creative Cloud", "adobe", "Software & SaaS", "subscription"))

    # 4. OpenAI ChatGPT Plus: ₹1,999 monthly on ~8th
    for m in range(5, 0, -1):
        d = today - timedelta(days=m * 30 + 7)
        demo_data.append((d, 199900, "CARD PMT CHATGPT SUBSCRIPTION OPENAI", "OpenAI ChatGPT", "chatgpt_openai", "Software & SaaS", "subscription"))

    # 5. Google One Storage: ₹130 monthly on ~18th
    for m in range(6, 0, -1):
        d = today - timedelta(days=m * 30 - 1)
        demo_data.append((d, 13000, "GOOGLE*STORAGE CLOUD MOUNTAIN VIEW", "Google One", "google_one", "Cloud & Storage", "subscription"))

    # 6. BESCOM Electricity (Variable Recurring Bill): ~₹1,400-1,600 monthly
    elec_amounts = [142000, 158000, 139000, 165000, 148000, 151000]
    for m, amt in enumerate(elec_amounts, start=1):
        d = today - timedelta(days=m * 30 + 5)
        demo_data.append((d, amt, "BESCOM ONLINE ELEC BILL PAYMENT BANGALORE", "Electricity Bill", "electricity_board", "Utilities", "recurring_bill"))

    # 7. Cult.fit: ₹1,499 quarterly (~90 days)
    for q in range(3, 0, -1):
        d = today - timedelta(days=q * 91 + 3)
        demo_data.append((d, 149900, "CULT FIT HEALTHCARE BANGALORE KA", "Cult.fit", "cult_fit", "Fitness & Wellness", "membership"))

    # 8. House Rent: ₹22,000 monthly
    for m in range(6, 0, -1):
        d = today - timedelta(days=m * 30 + 20)
        demo_data.append((d, 2200000, "NEFT-RENT PAYMENT TO LANDLORD APARTMENT", "House Rent", "house_rent", "Housing & Rent", "recurring_bill"))

    # 9. One-time non-recurring transactions (to verify the detector ignores one-offs!)
    demo_data.append((today - timedelta(days=14), 149900, "AMAZON RETAIL MUMBAI ELECTRONICS CABLE", "Amazon Retail", "amazon_retail", "Shopping", "one_time"))
    demo_data.append((today - timedelta(days=42), 349900, "AMZN MKTP US*SHOES RUNNING", "Amazon Retail", "amazon_retail", "Shopping", "one_time"))
    demo_data.append((today - timedelta(days=68), 89900, "SWIGGY BANGALORE RESTAURANT FOOD ORDER", "Swiggy", "swiggy", "Food & Dining", "one_time"))
    demo_data.append((today - timedelta(days=110), 125000, "ZOMATO RESTAURANT DINNER WEEKEND", "Zomato", "zomato", "Food & Dining", "one_time"))

    batch = ImportBatch(
        user_id=user.id,
        filename="portfolio_fictional_statement.csv",
        file_size_bytes=10240,
        status="completed",
        total_rows=len(demo_data),
        imported_rows=len(demo_data),
        duplicate_rows=0
    )
    db.add(batch)
    db.flush()

    for item in demo_data:
        t_date, amt_minor, raw_desc, m_name, m_key, cat, rail = item
        clean_desc = raw_desc
        fp = f"{user.id}|{t_date.isoformat()}|{amt_minor}|{clean_desc.lower()}"
        txn = Transaction(
            user_id=user.id,
            import_id=batch.id,
            transaction_date=t_date,
            amount_minor=amt_minor,
            currency_code="INR",
            direction="debit",
            raw_description=raw_desc,
            normalized_description=m_name,
            merchant_name=m_name,
            merchant_key=m_key,
            category=cat,
            payment_rail="UPI" if "upi" in raw_desc.lower() else "Card",
            fingerprint=fp,
            is_duplicate=False
        )
        db.add(txn)

    db.commit()

    # Trigger detection
    run_detection_pipeline_for_user(user.id, db)

    return {
        "status": "success",
        "imported_rows": len(demo_data),
        "message": "Loaded 6 months of realistic portfolio demo transactions and calculated recurring streams."
    }


@router.delete("/reset")
def reset_user_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resets all transactions, streams, and cancellation cases for the current user."""
    db.query(RecurringStreamTransaction).filter(
        RecurringStreamTransaction.stream_id.in_(
            db.query(RecurringStream.id).filter(RecurringStream.user_id == user.id)
        )
    ).delete(synchronize_session=False)
    db.query(CancellationCase).filter(CancellationCase.user_id == user.id).delete()
    db.query(RecurringStream).filter(RecurringStream.user_id == user.id).delete()
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(ImportBatch).filter(ImportBatch.user_id == user.id).delete()
    db.commit()

    return {"status": "success", "message": "All user financial data safely reset."}
