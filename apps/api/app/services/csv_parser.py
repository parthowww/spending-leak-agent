import csv
import io
import re
import hashlib
from datetime import date, datetime
from typing import List, Dict, Any, Tuple, Optional
from dateutil import parser as date_parser
from app.services.merchant_normalizer import normalize_merchant, clean_description

# Common column name heuristics (lowercased, stripped)
DATE_HEADERS = ["date", "transaction date", "txn date", "value date", "posting date", "posted date", "trans date"]
DESC_HEADERS = ["description", "narration", "particulars", "memo", "details", "merchant", "payee", "transaction details", "remarks"]
AMOUNT_HEADERS = ["amount", "txn amount", "transaction amount", "net amount"]
DEBIT_HEADERS = ["debit", "withdrawal", "dr", "debit amount", "withdrawals", "spent"]
CREDIT_HEADERS = ["credit", "deposit", "cr", "credit amount", "deposits", "received"]
TYPE_HEADERS = ["type", "direction", "dr/cr", "cr/dr", "transaction type"]

def parse_amount_to_minor(val_str: str) -> Tuple[int, str]:
    """
    Parses a string amount into integer minor units (paise/cents) and direction ('debit' or 'credit').
    Handles symbols (₹, $, €, £), commas, quotes, parentheses for negatives, and sign prefixes.
    """
    if not val_str:
        return 0, "debit"
    
    cleaned = str(val_str).strip()
    
    # Check for parentheses indicating negative/debit (e.g. "(499.00)")
    is_paren_negative = False
    if cleaned.startswith("(") and cleaned.endswith(")"):
        is_paren_negative = True
        cleaned = cleaned[1:-1]
        
    # Remove currency symbols and formatting commas
    cleaned = re.sub(r"[₹\$\€\£\s,]", "", cleaned)
    
    # Check for minus sign
    is_minus = False
    if cleaned.startswith("-") or is_paren_negative:
        is_minus = True
        cleaned = cleaned.lstrip("-")
    elif cleaned.startswith("+"):
        cleaned = cleaned.lstrip("+")
        
    try:
        val_float = float(cleaned)
        minor_units = int(round(val_float * 100))
        # If negative, it is an outflow/debit
        direction = "debit" if is_minus or val_float > 0 else "credit"
        return abs(minor_units), direction
    except ValueError:
        return 0, "debit"


def parse_date_flexible(date_str: str) -> Optional[date]:
    """Parses date string across Indian, US, and ISO formats safely."""
    if not date_str:
        return None
    cleaned = date_str.strip()
    
    # Common format attempts
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y",
        "%d/%m/%y", "%d-%m-%y", "%d-%b-%Y", "%d-%B-%Y",
        "%d %b %Y", "%d %B %Y", "%Y/%m/%d"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
            
    # Fallback to dateutil parser with dayfirst=True (standard in India and Europe)
    try:
        dt = date_parser.parse(cleaned, dayfirst=True)
        return dt.date()
    except Exception:
        return None


class CSVTransactionParser:
    def __init__(self, user_id: str, default_currency: str = "INR"):
        self.user_id = user_id
        self.default_currency = default_currency

    def parse_csv_content(self, content_str: str, existing_fingerprints: set[str] = None) -> Dict[str, Any]:
        """
        Parses CSV string content, identifies column mapping automatically,
        normalizes rows, deduplicates, and returns structured data.
        """
        if existing_fingerprints is None:
            existing_fingerprints = set()

        lines = [line for line in content_str.splitlines() if line.strip()]
        if not lines:
            return {"transactions": [], "stats": {"total_rows": 0, "imported_rows": 0, "duplicate_rows": 0, "errors": 0}}

        # Detect dialect (delimiter)
        sample = "\n".join(lines[:min(10, len(lines))])
        try:
            dialect = csv.Sniffer().sniff(sample)
            delimiter = dialect.delimiter
        except Exception:
            delimiter = "," if "," in sample else "\t"

        reader = csv.reader(io.StringIO(content_str), delimiter=delimiter)
        raw_rows = list(reader)

        # Locate header row (first row containing recognizable date/desc/amount keywords)
        header_idx = -1
        col_map = {}

        for idx, row in enumerate(raw_rows[:15]):
            lowered = [c.strip().lower() for c in row]
            has_date = any(any(h in c for h in DATE_HEADERS) for c in lowered)
            has_desc = any(any(h in c for h in DESC_HEADERS) for c in lowered)
            has_amt = any(any(h in c for h in AMOUNT_HEADERS + DEBIT_HEADERS + CREDIT_HEADERS) for c in lowered)
            
            if (has_date and has_desc) or (has_date and has_amt):
                header_idx = idx
                break

        if header_idx == -1:
            # Fallback to row 0 if no clear header was matched
            header_idx = 0

        header_row = [c.strip().lower() for c in raw_rows[header_idx]]
        
        # Map columns
        date_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in DATE_HEADERS)), 0)
        desc_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in DESC_HEADERS)), 1 if len(header_row) > 1 else 0)
        debit_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in DEBIT_HEADERS)), None)
        credit_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in CREDIT_HEADERS)), None)
        amount_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in AMOUNT_HEADERS)), None)
        type_col = next((i for i, c in enumerate(header_row) if any(h == c or h in c for h in TYPE_HEADERS)), None)

        # Fallback if specific amount headers weren't named exactly
        if debit_col is None and credit_col is None and amount_col is None:
            # Look for column with numeric values in first few data rows
            amount_col = len(header_row) - 1

        transactions = []
        seen_batch_fingerprints = set()
        duplicate_count = 0
        error_count = 0

        data_rows = raw_rows[header_idx + 1:]
        total_rows = len(data_rows)

        for row in data_rows:
            if not row or not any(cell.strip() for cell in row):
                continue
            
            # Check length safety
            max_idx = max(filter(lambda x: x is not None, [date_col, desc_col, debit_col, credit_col, amount_col, type_col]))
            if len(row) <= max_idx:
                error_count += 1
                continue

            # Parse date
            parsed_date = parse_date_flexible(row[date_col])
            if not parsed_date:
                error_count += 1
                continue

            raw_desc = row[desc_col].strip()
            if not raw_desc:
                error_count += 1
                continue

            # Determine Amount & Direction
            amount_minor = 0
            direction = "debit"

            if debit_col is not None and credit_col is not None:
                debit_str = row[debit_col].strip() if debit_col < len(row) else ""
                credit_str = row[credit_col].strip() if credit_col < len(row) else ""
                
                if debit_str and debit_str != "-" and debit_str != "0":
                    amount_minor, _ = parse_amount_to_minor(debit_str)
                    direction = "debit"
                elif credit_str and credit_str != "-" and credit_str != "0":
                    amount_minor, _ = parse_amount_to_minor(credit_str)
                    direction = "credit"
                else:
                    error_count += 1
                    continue
            elif amount_col is not None:
                amt_str = row[amount_col].strip()
                parsed_minor, parsed_dir = parse_amount_to_minor(amt_str)
                amount_minor = parsed_minor
                direction = parsed_dir

                # Override with type column if present
                if type_col is not None and type_col < len(row):
                    t_val = row[type_col].strip().lower()
                    if "cr" in t_val or "credit" in t_val or "deposit" in t_val:
                        direction = "credit"
                    elif "dr" in t_val or "debit" in t_val or "withdrawal" in t_val:
                        direction = "debit"

            if amount_minor == 0:
                continue

            # Normalize description and merchant
            clean_desc = clean_description(raw_desc)
            merchant_name, merchant_key, category, stream_type = normalize_merchant(raw_desc)

            # Generate deduplication fingerprint: sha256(user_id | date | amount_minor | clean_desc)
            fp_raw = f"{self.user_id}|{parsed_date.isoformat()}|{amount_minor}|{clean_desc.lower()}"
            fingerprint = hashlib.sha256(fp_raw.encode("utf-8")).hexdigest()

            if fingerprint in existing_fingerprints or fingerprint in seen_batch_fingerprints:
                duplicate_count += 1
                continue

            seen_batch_fingerprints.add(fingerprint)

            transactions.append({
                "transaction_date": parsed_date,
                "amount_minor": amount_minor,
                "amount_display": round(amount_minor / 100.0, 2),
                "currency_code": self.default_currency,
                "direction": direction,
                "raw_description": raw_desc,
                "normalized_description": clean_desc,
                "merchant_name": merchant_name,
                "merchant_key": merchant_key,
                "category": category,
                "payment_rail": "UPI" if "upi" in raw_desc.lower() else ("Card" if "card" in raw_desc.lower() or "pos" in raw_desc.lower() else "Bank Transfer"),
                "fingerprint": fingerprint,
                "is_duplicate": False,
                "metadata_json": "{}"
            })

        return {
            "transactions": transactions,
            "stats": {
                "total_rows": total_rows,
                "imported_rows": len(transactions),
                "duplicate_rows": duplicate_count,
                "errors": error_count
            }
        }
