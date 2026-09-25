from datetime import date, timedelta
from app.services.recurrence_detector import RecurrenceDetector, calculate_recurrence_confidence

def test_confidence_formula():
    conf = calculate_recurrence_confidence(
        occurrences=4,
        interval_score=1.0,
        amount_score=1.0,
        merchant_score=1.0,
        recency_score=1.0
    )
    assert conf == 1.0

def test_monthly_recurrence_detection():
    today = date(2026, 9, 25)
    txns = []
    # 4 monthly Netflix charges
    for i in range(4, 0, -1):
        txns.append({
            "id": f"txn_{i}",
            "transaction_date": today - timedelta(days=i * 30),
            "amount_minor": 49900,
            "currency_code": "INR",
            "direction": "debit",
            "raw_description": "NETFLIX",
            "merchant_name": "Netflix",
            "merchant_key": "netflix",
            "category": "Streaming & Entertainment",
            "is_duplicate": False
        })
    
    # Random one-off purchase
    txns.append({
        "id": "txn_amazon",
        "transaction_date": today - timedelta(days=15),
        "amount_minor": 89900,
        "currency_code": "INR",
        "direction": "debit",
        "raw_description": "AMAZON ONE OFF",
        "merchant_name": "Amazon",
        "merchant_key": "amazon",
        "category": "Shopping",
        "is_duplicate": False
    })

    detector = RecurrenceDetector(as_of_date=today)
    streams = detector.detect_streams(txns)

    assert len(streams) == 1
    s = streams[0]
    assert s["merchant_key"] == "netflix"
    assert s["frequency"] == "monthly"
    assert s["occurrence_count"] == 4
    assert s["amount_minor"] == 49900
    assert s["annualized_cost_minor"] == 49900 * 12
    assert s["confidence_score"] >= 0.85
