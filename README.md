# Spending-Leak Agent 🛡️💳

An explainable personal-finance web application that analyzes uploaded bank and card transaction CSVs, identifies forgotten recurring subscriptions and spending leaks, estimates potential annual savings, and guides users through official, verified merchant cancellation routes.

---

## 🌟 Key Highlights & Philosophy

- **Deterministic & Explainable Detection**: Financial calculations, cadence detection, interval math, and confidence ratings are computed using transparent mathematical formulas—**never** by black-box LLMs.
- **Assisting AI Layer**: LLMs (Google Gemini) are strictly constrained to generating calm plain-language explanations of detected evidence, drafting formal cancellation emails, and categorizing unknown merchants. The AI **never** calculates money, invents links, or cancels services autonomously.
- **Verified Cancellation Navigator**: Rather than attempting risky automated cancellations, the agent provides official verified cancellation links (e.g. Netflix, Spotify, Adobe), step-by-step instructions, and guidance on revoking UPI AutoPay / Credit Card recurring mandates in banking apps.
- **Tenant Data Isolation**: Multi-tenant architecture ensuring all imported statements, transactions, and streams remain strictly isolated to the authenticated user ID.
- **Zero Credential Storage**: Does not ask for or store bank passwords, UPI PINs, OTPs, or full card numbers.

---

## 📚 Dedicated Documentation & Guides

| Guide | Description |
| :--- | :--- |
| [**Problem & Detection Engine**](file:///home/parthow/Downloads/spending-leak-agent/docs/PROBLEM_AND_DETECTION_ENGINE.md) | Deep dive on subscription leakage in India, why black-box LLMs fail at finance, mathematical cadence formulas, confidence scoring weights, and deduplication hashing. |
| [**Backend API Architecture**](file:///home/parthow/Downloads/spending-leak-agent/apps/api/README.md) | FastAPI services, Pydantic schemas, SQLAlchemy models, multi-bank CSV parser, recurrence detector, test suite, and REST API endpoint reference. |
| [**Frontend Web App & All Pages**](file:///home/parthow/Downloads/spending-leak-agent/apps/web/README.md) | Next.js 16 (App Router) + React 19 architecture, breakdown of all 4 pages (`/`, `/app`, `/login`, `404`), component library, modals, state management, and Tailwind CSS v4 styling. |
| [**Supabase Auth & Tenant Isolation**](file:///home/parthow/Downloads/spending-leak-agent/docs/SUPABASE_AUTH_AND_TENANT_ISOLATION.md) | Dual-mode auth strategy (Supabase JWT vs zero-friction demo mode), step-by-step Supabase project setup, database row-level isolation, and tenant switching guide. |

---

## 🏗️ Architecture & Tech Stack

```
spending-leak-agent/
├── apps/
│   ├── api/                    # Python FastAPI Backend
│   │   ├── app/
│   │   │   ├── config.py       # Pydantic v2 settings & environment variables
│   │   │   ├── database.py     # SQLAlchemy engine (SQLite / PostgreSQL)
│   │   │   ├── models/         # User, Transaction, RecurringStream, CancellationCase
│   │   │   ├── schemas/        # Pydantic request/response schemas
│   │   │   ├── services/
│   │   │   │   ├── csv_parser.py           # Multi-format CSV parser & deduplicator
│   │   │   │   ├── merchant_normalizer.py  # Noise stripper & canonical directory
│   │   │   │   ├── recurrence_detector.py  # Rule-based recurrence & confidence engine
│   │   │   │   ├── cancellation_directory.py # Official verified merchant guides
│   │   │   │   ├── ai_explainer.py         # Gemini API / deterministic fallback
│   │   │   │   └── auth.py                 # Supabase JWT & tenant isolation
│   │   │   └── routers/
│   │   │       ├── auth.py, imports.py, transactions.py, recurring.py,
│   │   │       ├── cancellation.py, dashboard.py
│   │   ├── tests/              # Pytest test suite (11 unit & integration tests)
│   │   ├── sample_data/        # Realistic bank statement CSVs
│   │   ├── Dockerfile          # Production backend container
│   │   └── requirements.txt
│   │
│   └── web/                    # Next.js 16 + React 19 Frontend
│       ├── src/
│       │   ├── app/            # App Router (page.tsx, layout.tsx, globals.css)
│       │   ├── components/     # Dashboard, SubscriptionCards, Modals, Tables
│       │   ├── lib/            # Typed API client & Supabase client
│       │   └── types/          # TypeScript definitions
│       ├── Dockerfile          # Production web container
│       ├── package.json
│       └── vercel.json
│
├── render.yaml                 # Render Blueprint for FastAPI + PostgreSQL
├── docker-compose.yml          # Multi-container local orchestration
└── README.md
```

---

## ⚡ Detection Engine Specifications

The recurrence detector analyzes non-duplicate debit transactions across regular cadence windows:

| Frequency | Expected Interval | Tolerance | Annual Cost Multiplier |
| :--- | :--- | :--- | :--- |
| **Weekly** | 7.0 days | ±2.5 days | × 52 |
| **Bi-weekly** | 14.0 days | ±3.5 days | × 26 |
| **Monthly** | 30.4 days | ±7.5 days | × 12 |
| **Quarterly** | 91.3 days | ±14.0 days | × 4 |
| **Semi-annual** | 182.6 days | ±21.0 days | × 2 |
| **Annual** | 365.2 days | ±35.0 days | × 1 |

### Confidence Score Formula
$$\text{Confidence} = 0.30 \times \text{Occurrences} + 0.30 \times \text{Interval Fit} + 0.20 \times \text{Amount Consistency} + 0.10 \times \text{Merchant Match} + 0.10 \times \text{Recency}$$

---

## 🚀 Quickstart (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Start the FastAPI Backend
```bash
cd apps/api

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server (default database is local SQLite)
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Start the Next.js Frontend
In a new terminal:
```bash
cd apps/web

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Running Automated Tests

Run the complete backend test suite covering normalization, multi-bank CSV parsing, deduplication, recurrence scoring, and end-to-end API workflows:

```bash
cd /path/to/spending-leak-agent
PYTHONPATH=apps/api ./apps/api/venv/bin/pytest apps/api/tests -v
```

All 11 tests validate:
- ✅ Merchant alias matching and noise reduction
- ✅ Currency parsing (₹, $, commas, negatives, parentheses)
- ✅ Deduplication fingerprinting (`sha256(user_id|date|amount|normalized_desc)`)
- ✅ Monthly and quarterly cadence identification
- ✅ End-to-end user actions (`keep`, `cancel`, `not_subscription`)
- ✅ Cancellation guide retrieval and AI cancellation email drafting

---

## 📊 Portfolio Demo Scenario

Click the **"1-Click Demo Data"** button in the navbar to instantly seed a realistic 6-month transaction statement:
- **Netflix**: ₹499/month on the 15th (Streaming & Entertainment)
- **Spotify**: ₹119/month on the 5th (Streaming & Entertainment)
- **Adobe Creative Cloud**: ₹1,675/month on the 22nd (Software & SaaS)
- **OpenAI ChatGPT Plus**: ₹1,999/month on the 8th (Software & SaaS)
- **Google One**: ₹130/month on the 18th (Cloud & Storage)
- **BESCOM Electricity**: Variable ~₹1,350 - ₹1,580/month (Utility Recurring Bill)
- **Cult.fit Cultpass**: ₹1,499/quarter (Fitness & Wellness)
- **House Rent**: ₹22,000/month (Housing)
- **Non-recurring purchases**: Amazon electronics, clothing, Swiggy/Zomato food orders (correctly filtered out from subscriptions).

---

## 🌐 Production Deployment

### 1. Deploy Backend on Render
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New > Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and provisions:
   - Managed **PostgreSQL Database** (`spendleak-db`)
   - Web Service (`spending-leak-api`) running FastAPI on Python 3.12
4. In the Render environment tab, optionally supply:
   - `GEMINI_API_KEY`: Google AI Studio API key
   - `SUPABASE_URL` & `SUPABASE_JWT_SECRET`: For Supabase authentication

### 2. Deploy Frontend on Vercel
1. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project**.
2. Select your repository and choose **Root Directory**: `apps/web`.
3. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g. `https://spending-leak-api.onrender.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`: (Optional) Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Optional) Your Supabase anon public key
4. Click **Deploy**.

---

## 🔒 Security & Privacy

- **Row-Level Ownership**: Every database record includes a mandatory `user_id`. Queries strictly filter by `user_id`.
- **In-Memory Statement Parsing**: Uploaded CSV files are processed in memory and never stored in plain text.
- **Zero Critical Credentials**: No bank account passwords, card pins, or OTPs are requested or saved.
- **Formula Injection Mitigation**: Spreadsheet outputs and strings are escaped against CSV formula injection (`=`, `+`, `-`, `@`).
