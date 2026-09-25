import math
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
import statistics

CADENCES = [
    {"name": "weekly", "label": "Weekly", "expected_days": 7.0, "tolerance": 2.5, "annual_multiplier": 52.0},
    {"name": "biweekly", "label": "Bi-weekly", "expected_days": 14.0, "tolerance": 3.5, "annual_multiplier": 26.0},
    {"name": "monthly", "label": "Monthly", "expected_days": 30.4, "tolerance": 7.5, "annual_multiplier": 12.0},
    {"name": "quarterly", "label": "Quarterly", "expected_days": 91.3, "tolerance": 14.0, "annual_multiplier": 4.0},
    {"name": "semiannual", "label": "Semi-annual", "expected_days": 182.6, "tolerance": 21.0, "annual_multiplier": 2.0},
    {"name": "annual", "label": "Annual", "expected_days": 365.2, "tolerance": 35.0, "annual_multiplier": 1.0},
]

def calculate_recurrence_confidence(
    occurrences: int,
    interval_score: float,
    amount_score: float,
    merchant_score: float,
    recency_score: float
) -> float:
    """Interpretable scoring formula as defined in the architectural blueprint."""
    occurrence_score = min(occurrences / 4.0, 1.0)
    score = (
        0.30 * occurrence_score +
        0.30 * interval_score +
        0.20 * amount_score +
        0.10 * merchant_score +
        0.10 * recency_score
    )
    return round(max(0.0, min(1.0, score)), 4)


class RecurrenceDetector:
    """
    Transparent, rule-based recurring charge detection engine.
    Calculates intervals, statistical amount spreads, confidence ratings,
    annualized impact, and next predicted charge dates.
    """

    def __init__(self, as_of_date: Optional[date] = None):
        self.as_of_date = as_of_date or date.today()

    def detect_streams(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Filter for debit/outflow transactions
        debits = [t for t in transactions if t.get("direction") == "debit" and not t.get("is_duplicate")]
        
        # Group by merchant key
        merchant_groups = defaultdict(list)
        for t in debits:
            m_key = t.get("merchant_key", "unknown")
            merchant_groups[m_key].append(t)

        detected_streams = []

        for m_key, txns in merchant_groups.items():
            # At least 2 occurrences needed to identify an interval pattern
            if len(txns) < 2:
                continue

            # Sort chronologically
            sorted_txns = sorted(txns, key=lambda x: x["transaction_date"])
            dates = [t["transaction_date"] for t in sorted_txns]
            amounts = [t["amount_minor"] for t in sorted_txns]

            # Calculate day intervals between consecutive charges
            intervals = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
            if not intervals:
                continue

            median_interval = statistics.median(intervals)

            # Match to closest cadence
            matched_cadence = None
            min_cadence_diff = float("inf")

            for c in CADENCES:
                diff = abs(median_interval - c["expected_days"])
                if diff <= c["tolerance"] and diff < min_cadence_diff:
                    min_cadence_diff = diff
                    matched_cadence = c

            if not matched_cadence:
                # If intervals don't fit any known cadence, skip
                continue

            # Compute interval consistency score (0.0 to 1.0)
            # Check how many intervals fall within the tolerance
            valid_interval_count = sum(
                1 for d in intervals if abs(d - matched_cadence["expected_days"]) <= matched_cadence["tolerance"]
            )
            interval_consistency = valid_interval_count / len(intervals)
            interval_diff_ratio = max(0.0, 1.0 - (min_cadence_diff / matched_cadence["tolerance"]))
            interval_score = (interval_consistency * 0.7) + (interval_diff_ratio * 0.3)

            # Amount consistency
            median_amt = int(statistics.median(amounts))
            min_amt = min(amounts)
            max_amt = max(amounts)
            amt_spread = (max_amt - min_amt) / median_amt if median_amt > 0 else 1.0

            if amt_spread <= 0.03:
                # Exact or nearly exact fixed fee (classic subscription)
                amount_score = 1.0
            elif amt_spread <= 0.20:
                amount_score = 0.85
            elif amt_spread <= 0.40:
                amount_score = 0.65
            else:
                amount_score = max(0.2, 1.0 - amt_spread)

            # Merchant score (boost if in known catalog)
            first_txn = sorted_txns[0]
            is_known = first_txn.get("merchant_key") not in ["unknown_merchant", "other"]
            merchant_score = 1.0 if is_known else 0.7

            # Recency score
            last_date = dates[-1]
            days_since_last = (self.as_of_date - last_date).days
            expected_days = matched_cadence["expected_days"]
            
            if days_since_last <= expected_days * 1.5:
                recency_score = 1.0
            elif days_since_last <= expected_days * 2.5:
                recency_score = 0.7
            else:
                recency_score = max(0.2, 1.0 - (days_since_last / (expected_days * 4)))

            confidence = calculate_recurrence_confidence(
                occurrences=len(sorted_txns),
                interval_score=interval_score,
                amount_score=amount_score,
                merchant_score=merchant_score,
                recency_score=recency_score
            )

            # If confidence is below minimum threshold (e.g. 0.35), skip false alarm
            if confidence < 0.35:
                continue

            # Annualized Cost
            annualized_cost = int(round(median_amt * matched_cadence["annual_multiplier"]))

            # Predicted next charge date
            next_charge = last_date + timedelta(days=int(round(matched_cadence["expected_days"])))
            # If the calculated next charge date is in the past, project forward to next upcoming cycle
            while next_charge < self.as_of_date:
                next_charge += timedelta(days=int(round(matched_cadence["expected_days"])))

            # Stream type classification
            merchant_category = first_txn.get("category", "Subscription")
            if "Utilities" in merchant_category or "Telecom" in merchant_category or amt_spread > 0.15:
                stream_type = "recurring_bill"
            elif "Rent" in merchant_category:
                stream_type = "recurring_bill"
            elif "Fitness" in merchant_category or "Membership" in merchant_category:
                stream_type = "membership"
            elif "Loan" in merchant_category or "EMI" in merchant_category:
                stream_type = "installment"
            else:
                stream_type = "subscription"

            # Leak prioritization score (higher for subscriptions, entertainment, duplicates, or high annual spend)
            base_leak = (annualized_cost / 100000.0)  # scale
            type_multiplier = 1.2 if stream_type == "subscription" else (0.8 if stream_type == "membership" else 0.4)
            leak_score = round(min(10.0, (confidence * 5.0 * type_multiplier) + min(5.0, base_leak)), 2)

            # Plain-language detection reason
            currency = first_txn.get("currency_code", "INR")
            curr_sym = "₹" if currency == "INR" else "$"
            median_display = f"{curr_sym}{median_amt / 100:.2f}"
            
            if amt_spread < 0.05:
                amt_desc = f"fixed {median_display}"
            else:
                amt_desc = f"average {median_display} (varying between {curr_sym}{min_amt/100:.2f} and {curr_sym}{max_amt/100:.2f})"

            reason = (
                f"Identified {len(sorted_txns)} {matched_cadence['label'].lower()} charges "
                f"spaced ~{int(round(median_interval))} days apart with {amt_desc}. "
                f"Statistical confidence: {int(confidence * 100)}%."
            )

            evidence = {
                "cadence_label": matched_cadence["label"],
                "intervals_days": intervals,
                "median_interval_days": median_interval,
                "amount_spread_pct": round(amt_spread * 100, 1),
                "scoring_breakdown": {
                    "occurrences": len(sorted_txns),
                    "interval_score": round(interval_score, 2),
                    "amount_consistency": round(amount_score, 2),
                    "merchant_confidence": round(merchant_score, 2),
                    "recency": round(recency_score, 2)
                },
                "supporting_transaction_ids": [t.get("id") for t in sorted_txns if t.get("id")]
            }

            detected_streams.append({
                "merchant_name": first_txn.get("merchant_name", "Unknown Merchant"),
                "merchant_key": m_key,
                "category": merchant_category,
                "stream_type": stream_type,
                "frequency": matched_cadence["name"],
                "expected_interval_days": matched_cadence["expected_days"],
                "amount_minor": median_amt,
                "min_amount_minor": min_amt,
                "max_amount_minor": max_amt,
                "currency_code": currency,
                "first_seen_at": dates[0],
                "last_seen_at": dates[-1],
                "predicted_next_charge_at": next_charge,
                "occurrence_count": len(sorted_txns),
                "confidence_score": confidence,
                "leak_score": leak_score,
                "annualized_cost_minor": annualized_cost,
                "detection_reason": reason,
                "evidence": evidence,
                "transactions": sorted_txns
            })

        # Sort streams by leak score descending (highest priority to review first)
        detected_streams.sort(key=lambda s: s["leak_score"], reverse=True)
        return detected_streams
