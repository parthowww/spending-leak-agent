from datetime import date
from app.services.csv_parser import CSVTransactionParser, parse_amount_to_minor, parse_date_flexible

def test_amount_parsing():
    amt, direction = parse_amount_to_minor("₹499.00")
    assert amt == 49900
    assert direction == "debit"

    amt, direction = parse_amount_to_minor("-1,675.50")
    assert amt == 167550
    assert direction == "debit"

    amt, direction = parse_amount_to_minor("(120.00)")
    assert amt == 12000
    assert direction == "debit"

    amt, direction = parse_amount_to_minor("50000.00")
    assert amt == 5000000

def test_flexible_date_parsing():
    assert parse_date_flexible("2026-04-15") == date(2026, 4, 15)
    assert parse_date_flexible("15/04/2026") == date(2026, 4, 15)
    assert parse_date_flexible("15-04-2026") == date(2026, 4, 15)

def test_csv_parser_and_deduplication():
    csv_text = """Date,Description,Debit,Credit
2026-04-15,UPI/NETFLIX/paytm,499.00,
2026-04-15,UPI/NETFLIX/paytm,499.00,
2026-05-15,UPI/NETFLIX/paytm,499.00,
"""
    parser = CSVTransactionParser(user_id="test_user_1")
    res = parser.parse_csv_content(csv_text)
    txns = res["transactions"]
    stats = res["stats"]

    assert len(txns) == 2
    assert stats["duplicate_rows"] == 1
    assert txns[0]["amount_minor"] == 49900
