# ⚙️ Spending-Leak Agent — Backend API

FastAPI-powered REST backend providing deterministic subscription recurrence detection, multi-bank CSV parsing, explainable confidence scoring, verified cancellation guides, and multi-tenant data isolation.

---

## 🏛️ Architecture Overview

The backend is built with Python 3.10+ and FastAPI. It follows a clean service-oriented layered architecture:

```
apps/api/
├── app/
│   ├── main.py                     # FastAPI entrypoint, CORS configuration, router mounts
│   ├── config.py                   # Pydantic Settings (env vars, secrets, database URLs)
│   ├── database.py                 # SQLAlchemy engine & session factory (SQLite / PostgreSQL)
│   ├── models/                     # SQLAlchemy declarative ORM models
│   │   ├── user.py                 # User identity & multi-tenant profile
│   │   ├── transaction.py          # Imported ledger transactions & deduplication hash
│   │   ├── recurring.py            # Detected recurring subscription streams
│   │   └── cancellation.py         # Cancellation guides, cases & email logs
│   ├── schemas/                    # Pydantic v2 validation models (Request/Response)
│   │   ├── transaction.py          # Transaction payloads, filters & pagination
│   │   ├── recurring.py            # Stream decisions, confidence metrics, updates
│   │   ├── cancellation.py         # Cancellation case records, email draft schemas
│   │   └── dashboard.py            # Summary metrics, KPI cards, upcoming charges
│   ├── services/                   # Core business logic & deterministic math engines
│   │   ├── csv_parser.py           # Bank CSV parser, currency parsing & deduplication
│   │   ├── merchant_normalizer.py  # Regex cleaning & canonical merchant directory
│   │   ├── recurrence_detector.py  # Deterministic cadence detection & confidence engine
│   │   ├── cancellation_directory.py # Official verified cancellation manuals & links
│   │   ├── ai_explainer.py         # Gemini API / deterministic fallback for plain text
│   │   └── auth.py                 # Supabase JWT validator & demo tenant resolver
│   └── routers/                    # REST API route controllers
│       ├── auth.py                 # Current user identity (/me)
│       ├── imports.py              # CSV file upload, demo data seeding, data reset
│       ├── transactions.py         # Transaction query, manual creation, deletion
│       ├── recurring.py            # Detected stream listings, decisions, AI explanation
│       ├── cancellation.py         # Cancellation guide lookup, cases, email drafting
│       └── dashboard.py            # High-level financial KPIs & category aggregation
├── tests/                          # Pytest test suite (11 unit & integration tests)
│   ├── test_api.py                 # End-to-end integration flow tests
│   ├── test_csv_parser.py          # Flexible dates, currencies & deduplication
│   ├── test_merchant_normalizer.py # Alias matching & noise stripping
│   └── test_recurrence_detector.py # Math cadence & confidence calculation
├── sample_data/                    # Sample bank CSVs for testing and benchmarking
├── Dockerfile                      # Production container image
├── requirements.txt                # Python dependencies
└── render.yaml                     # Render deployment configuration
```

---

## 🧮 Core Engine Services

### 1. Recurrence Detector (`app/services/recurrence_detector.py`)
- Groups debit transactions by canonical merchant key.
- Analyzes pairwise transaction intervals across calibrated cadence windows:
  - **Weekly:** 7 ± 2.5 days
  - **Bi-weekly:** 14 ± 3.5 days
  - **Monthly:** 30.4 ± 7.5 days
  - **Quarterly:** 91.3 ± 14.0 days
  - **Semi-annual:** 182.6 ± 21.0 days
  - **Annual:** 365.2 ± 35.0 days
- Computes an explainable confidence score from 0.0 to 1.0:
  $$\text{Confidence} = 0.30 \times \text{Occurrences} + 0.30 \times \text{IntervalFit} + 0.20 \times \text{AmountConsistency} + 0.10 \times \text{MerchantMatch} + 0.10 \times \text{Recency}$$

### 2. Multi-Bank CSV Parser (`app/services/csv_parser.py`)
- Detects column layouts dynamically across major Indian banks (HDFC, SBI, ICICI, Axis, Kotak, Standard Chartered, and generic global CSVs).
- Handles Indian currency formats (`₹`, commas like `1,49,900.00`, parentheses for debits `(499.00)`, and explicit debit/credit direction flags).
- Computes a deterministic SHA-256 fingerprint for deduplication:
  $$\text{fingerprint} = \text{SHA256}(\text{user\_id} \parallel \text{date} \parallel \text{amount} \parallel \text{normalized\_description})$$

### 3. Merchant Normalizer (`app/services/merchant_normalizer.py`)
- Strips banking payment rail noise: `UPI-`, `POS `, `NEFT `, `ACH/`, `BILLDESK/`, `RAZORPAY*`, transaction IDs, and merchant city suffixes.
- Maps raw descriptors to canonical entities (e.g., `NF*NETFLIX MUMBAI` → `Netflix`, `C*SPOTIFY INDIA` → `Spotify`, `ADOBE SYS IN` → `Adobe Creative Cloud`).
- Assigns industry categories (`Streaming & Entertainment`, `Software & SaaS`, `Cloud & Storage`, `Fitness & Wellness`, `Utilities`, `Housing`).

### 4. Cancellation Directory (`app/services/cancellation_directory.py`)
- Curated, verified, step-by-step guides for popular subscription services:
  - Official cancellation portal URLs
  - Navigation click pathways
  - Refund policy reminders & early termination fee warnings (e.g. Adobe annual commitment)
  - Bank-level mandate revocation guidelines (UPI AutoPay in PhonePe/GooglePay/BHIM, e-Mandate cancellation in NetBanking)

### 5. Gemini AI Explainer (`app/services/ai_explainer.py`)
- Uses Google Gemini API (`gemini-1.5-flash`) exclusively for generating plain-English executive summaries and polite formal cancellation emails.
- **Fail-safe fallback:** If `GEMINI_API_KEY` is absent or the API is unreachable, the system automatically uses deterministic rule-based template generation. **No black-box AI is ever used for financial calculation or cadence detection.**

---

## 📡 REST API Reference

### Health & Auth
- `GET /health` — Health check endpoint (`{"status":"ok"}`)
- `GET /api/v1/auth/me` — Returns authenticated user profile and tenant ID

### Imports & Statements
- `POST /api/v1/imports/csv` — Multipart CSV file upload; parses and recalculates recurring streams
- `POST /api/v1/imports/load-demo` — Seeds 6 months of realistic transactions (Netflix, Spotify, Adobe, ChatGPT Plus, Google One, Bescom, Rent, Cult.fit, Amazon purchases)
- `DELETE /api/v1/imports/reset` — Wipes all transactions, streams, and cases for the active user

### Transactions
- `GET /api/v1/transactions` — Paginated list of ledger entries with filters (`page`, `limit`, `search`, `category`, `direction`)
- `POST /api/v1/transactions/manual` — Insert a single manual transaction
- `DELETE /api/v1/transactions/{id}` — Remove transaction and re-evaluate recurrence streams

### Recurring Streams
- `GET /api/v1/recurring-streams` — Retrieve detected subscription streams (`status`, `category` query filters)
- `GET /api/v1/recurring-streams/{id}` — Details for a specific detected recurring stream
- `POST /api/v1/recurring-streams/{id}/decision` — Record user action (`keep`, `review`, `cancel`, `not_subscription`, `remind_later`)
- `POST /api/v1/recurring-streams/{id}/ai-explanation` — Generate plain-language detection explanation

### Cancellation Navigator
- `GET /api/v1/cancellation/guide/{stream_id}` — Official step-by-step cancellation instructions
- `POST /api/v1/cancellation/case/{stream_id}` — Log user cancellation progress
- `POST /api/v1/cancellation/draft-email/{stream_id}` — Draft formal cancellation email to customer support

### Dashboard
- `GET /api/v1/dashboard/summary` — Full overview metrics (total monthly/annual spend, potential savings, review queue count, category breakdown, upcoming expected charges, AI summary)

---

## 🛠️ Local Development & Setup

### 1. Set Up Python Environment
```bash
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables (`.env`)
Create a `.env` file in `apps/api/`:
```env
# Optional: SQLite used by default if omitted
DATABASE_URL=sqlite:///../../spendleak.db

# Optional: Google Gemini API for plain-language text generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase configuration (demo header isolation used if omitted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

### 3. Run the Development Server
```bash
PYTHONPATH=. uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Swagger UI will be available at: **http://127.0.0.1:8000/docs**

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
cd /path/to/spending-leak-agent
PYTHONPATH=apps/api ./apps/api/venv/bin/pytest apps/api/tests -v
```

Expected output:
```
apps/api/tests/test_api.py::test_health PASSED
apps/api/tests/test_api.py::test_load_demo_and_dashboard_flow PASSED
apps/api/tests/test_csv_parser.py::test_amount_parsing PASSED
apps/api/tests/test_csv_parser.py::test_flexible_date_parsing PASSED
apps/api/tests/test_csv_parser.py::test_csv_parser_and_deduplication PASSED
apps/api/tests/test_merchant_normalizer.py::test_netflix_normalization PASSED
apps/api/tests/test_merchant_normalizer.py::test_spotify_normalization PASSED
apps/api/tests/test_merchant_normalizer.py::test_adobe_normalization PASSED
apps/api/tests/test_merchant_normalizer.py::test_unknown_merchant_fallback PASSED
apps/api/tests/test_recurrence_detector.py::test_confidence_formula PASSED
apps/api/tests/test_recurrence_detector.py::test_monthly_recurrence_detection PASSED
======================= 11 passed in 0.70s =======================
```
