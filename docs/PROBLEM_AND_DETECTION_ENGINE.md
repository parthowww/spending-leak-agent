# 🛡️ Problem Statement & Deterministic Detection Engine

A comprehensive technical deep dive into the subscription leakage problem, the dangers of black-box AI in personal finance, and the deterministic mathematical engine powering the **Spending-Leak Agent**.

---

## 📉 Part 1: The Subscription Leakage Problem

### The Modern Subscription Trap
Consumers and small businesses increasingly operate on subscription-first models. While individual monthly fees appear nominal (e.g., ₹119, ₹499, ₹1,499), recurring charges compound rapidly over time:
1. **Forgotten Free Trials:** Users sign up for 7- or 30-day free trials requiring payment details, and forget to cancel before recurring billing triggers.
2. **Ghost SaaS & Multi-Device Clutter:** Legacy software tools, cloud storage add-ons, or niche entertainment subscriptions remain active long after active usage stops.
3. **Friction by Design ("Dark Patterns"):** Many service providers deliberately conceal cancellation buttons behind multi-step questionnaires, obscure retention offers, or customer support phone queues.
4. **UPI AutoPay & e-Mandates in India:** The Reserve Bank of India (RBI) introduced e-Mandate and UPI AutoPay frameworks. While providing security with pre-debit notifications, recurring mandates often operate silently in the background across separate banking apps (Paytm, PhonePe, Google Pay, NetBanking), making consolidated tracking difficult.

### Indian Bank Statement Realities
Unlike standardized open-banking APIs, standard users receive bank statements as messy CSV or PDF exports. Indian bank statements feature notorious quirks:
- **Inconsistent Column Headers:** One bank uses `Narration` and `Withdrawal Amt.`, another uses `Transaction Description` and `Debit`, while others use `Details`, `DR/CR`, or single `Amount` columns with sign flags.
- **Payment Rail Clutter:** Transaction descriptions are prepended with routing junk, such as:
  ```
  UPI/524389102834/NETFLIX ENTERTAIN/HDFC000123/48201
  POS 412345XXXXXX1029 SPOTIFY INDIA MUMBAI
  ACH/DR/BESCOM_BLR/1029384756/2026-08-15
  BIL/NEFT/00293849102/ADOBE SYSTEMS
  ```
- **Number & Currency Formatting:** Amounts appear as `₹1,49,900.00`, `-499.00`, `(1,675.00)`, or with trailing `Dr`/`Cr` suffixes.

---

## 🚫 Part 2: Why Black-Box AI Fails at Finance

Many modern "AI wrappers" feed raw transaction ledgers directly into Large Language Models (LLMs) with prompts like:
> *"Analyze this CSV and tell me all recurring subscriptions."*

### Why this is dangerously flawed:
1. **Stochastic Arithmetic (Hallucination):** LLMs are next-token probability predictors, not deterministic calculators. They frequently make basic arithmetic errors, miscalculate annualized amounts, or hallucinate phantom charges.
2. **Non-Reproducible Results:** Running the same statement through an LLM multiple times can yield differing recurring counts, inconsistent dates, or shifting totals.
3. **Data Privacy & Leakage:** Passing sensitive transaction ledgers to third-party model inference APIs exposes account numbers, daily habits, and personal expenditures.
4. **Dangerous Automation:** Autonomous "agentic cancellation" scripts that click through web portals or attempt automated card blocks can mistakenly cancel essential services (e.g. cloud backups, insurance, medical tools).

### Our Architecture: Hybrid Explainability
| Responsibility | Engine | Why? |
| :--- | :--- | :--- |
| **Cadence & Recurrence** | **Deterministic Python Math** | 100% predictable, testable, verifiable. |
| **Financial Calculations** | **Python Decimal / Float** | Zero arithmetic error tolerance. |
| **Deduplication** | **SHA-256 Hashing** | Cryptographically prevents double-counting. |
| **Merchant Canonicalization** | **Rule & Regex Normalizer** | Consistent entity resolution. |
| **Human Explanations** | **Google Gemini API (Assistive)** | LLMs excel at drafting clear English summaries and polite emails. |
| **Cancellation Execution** | **Human-in-the-Loop** | User follows official verified steps with zero account compromise risk. |

---

## 📐 Part 3: The Recurrence Detection Engine

The recurrence detection engine (`apps/api/app/services/recurrence_detector.py`) operates in four distinct phases:

### Phase 1: Grouping & Filtering
1. Filters out credit transactions, refunds, and known one-time categories.
2. Groups debit transactions by their normalized `canonical_merchant_key`.
3. Sorts transactions chronologically: $T = [t_1, t_2, \dots, t_n]$.
4. Evaluates whether occurrence count $n \ge 2$. Single occurrences cannot establish recurrence.

### Phase 2: Pairwise Interval Analysis
For consecutive transactions $t_i$ and $t_{i+1}$, the delta in days is calculated:
$$\Delta d_i = \text{Date}(t_{i+1}) - \text{Date}(t_i)$$

The engine evaluates these intervals against target frequency windows:

| Cadence | Expected Days ($\mu_0$) | Tolerance Window ($\tau$) | Allowed Range | Annual Multiplier |
| :--- | :--- | :--- | :--- | :--- |
| **Weekly** | $7.0$ days | $\pm 2.5$ days | $[4.5, 9.5]$ days | $\times 52$ |
| **Bi-weekly** | $14.0$ days | $\pm 3.5$ days | $[10.5, 17.5]$ days | $\times 26$ |
| **Monthly** | $30.4$ days | $\pm 7.5$ days | $[22.9, 37.9]$ days | $\times 12$ |
| **Quarterly** | $91.3$ days | $\pm 14.0$ days | $[77.3, 105.3]$ days | $\times 4$ |
| **Semi-annual** | $182.6$ days | $\pm 21.0$ days | $[161.6, 203.6]$ days | $\times 2$ |
| **Annual** | $365.2$ days | $\pm 35.0$ days | $[330.2, 400.2]$ days | $\times 1$ |

### Phase 3: Explainable Confidence Formula
The overall confidence score $C \in [0.0, 1.0]$ is computed as a weighted sum of 5 transparent statistical metrics:

$$C = 0.30 \cdot S_{\text{occurrences}} + 0.30 \cdot S_{\text{interval}} + 0.20 \cdot S_{\text{amount}} + 0.10 \cdot S_{\text{merchant}} + 0.10 \cdot S_{\text{recency}}$$

#### Breakdown of the 5 Scoring Factors:
1. **Occurrence Score ($S_{\text{occurrences}}$ — 30%):**
   $$S_{\text{occurrences}} = \min\left(1.0, \frac{n}{5}\right)$$
   - 2 occurrences = $0.40$
   - 3 occurrences = $0.60$
   - 4 occurrences = $0.80$
   - 5+ occurrences = $1.00$
2. **Interval Consistency Score ($S_{\text{interval}}$ — 30%):**
   Measures how closely the mean interval $\bar{\Delta d}$ matches the expected cadence $\mu_0$, scaled by interval standard deviation $\sigma_d$:
   $$S_{\text{interval}} = \max\left(0.0, 1.0 - \frac{|\bar{\Delta d} - \mu_0|}{\tau} - \frac{\sigma_d}{2\tau}\right)$$
3. **Amount Consistency Score ($S_{\text{amount}}$ — 20%):**
   Evaluates price stability. Subscriptions usually bill identical amounts (fixed price), while utility bills fluctuate slightly:
   $$CV_a = \frac{\sigma_a}{\bar{a}} \quad (\text{Coefficient of Variation})$$
   $$S_{\text{amount}} = \max(0.0, 1.0 - 2 \cdot CV_a)$$
   *(If $CV_a = 0$, amount score is $1.0$. If amounts vary by $>50\%$, score drops toward $0.0$.)*
4. **Merchant Match Score ($S_{\text{merchant}}$ — 10%):**
   - $1.0$ if the merchant maps to a verified catalog entity (e.g. Netflix, Spotify, Adobe).
   - $0.7$ if inferred via regex recurring keywords (`SUB`, `BILL`, `AUTOPAY`).
   - $0.4$ for unrecognized generic descriptors.
5. **Recency Score ($S_{\text{recency}}$ — 10%):**
   Rewards streams with active, current debits:
   $$S_{\text{recency}} = \begin{cases} 
   1.0 & \text{if last debit was within } 1.5 \times \text{expected cadence} \\
   0.5 & \text{if last debit was within } 2.5 \times \text{expected cadence} \\
   0.1 & \text{if stream appears dormant or expired}
   \end{cases}$$

### Phase 4: Next Charge Prediction
The engine calculates the next anticipated charge date deterministically:
$$\text{NextDate} = \text{Date}(t_{\text{last}}) + \mu_0 \text{ days}$$
This powers the **Upcoming Expected Charges** timeline in the dashboard.

---

## 🔒 Part 4: Ingestion & Deduplication Pipeline

To prevent statement re-uploads from duplicating transactions or distorting confidence scores, every incoming row is processed through a strict pipeline:

```
[Uploaded CSV File]
        ↓
[Multi-Bank Column Detection] (Date, Description, Debit/Credit, Amount)
        ↓
[Currency Sanitization] (Strip ₹/$, parse Indian comma grouping)
        ↓
[Regex Noise Stripping] (Remove UPI IDs, POS prefixes, terminal IDs)
        ↓
[SHA-256 Fingerprint Generation]
        ↓
[Database Uniqueness Check] → (Skip duplicates / Insert new records)
        ↓
[Trigger Recurrence Detector Engine]
```

### Deduplication Hash Formula:
```python
raw_key = f"{user_id}|{txn_date.isoformat()}|{amount_cents}|{normalized_description}"
fingerprint = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
```
If an identical statement is uploaded twice, 100% of duplicate transactions are safely ignored.
