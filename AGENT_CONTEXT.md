# 🛡️ Spending-Leak Agent — Agent Context & Handoff Document

> **For the next agent:** Read this entire file before touching anything.  
> Project is at `/home/parthow/Downloads/spending-leak-agent`

---

## 📁 Project Overview

A full-stack personal finance web app that:
- Parses bank statement CSVs (any Indian bank format)
- Detects recurring subscriptions using deterministic math (no black-box AI)
- Shows confidence scores, annual costs, upcoming charges
- Provides **official verified cancellation guides** for Netflix, Spotify, Adobe, etc.
- Uses Gemini AI **only** for plain-language summaries (never for calculations)

**Stack:**
- **Backend:** Python FastAPI + SQLAlchemy + SQLite (local) / PostgreSQL (prod)
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **AI:** Google Gemini API (optional, falls back gracefully)
- **Auth:** Supabase JWT (optional, falls back to demo user header)

---

## 🗂️ Full File Tree (Source Only)

```
spending-leak-agent/
├── apps/
│   ├── api/                          ← Python FastAPI Backend
│   │   ├── app/
│   │   │   ├── config.py             ← Pydantic v2 settings
│   │   │   ├── database.py           ← SQLAlchemy engine
│   │   │   ├── main.py               ← FastAPI app, CORS, router mounts
│   │   │   ├── models/
│   │   │   │   ├── user.py
│   │   │   │   ├── transaction.py
│   │   │   │   ├── recurring.py
│   │   │   │   └── cancellation.py
│   │   │   ├── schemas/
│   │   │   │   ├── transaction.py
│   │   │   │   ├── recurring.py
│   │   │   │   ├── cancellation.py
│   │   │   │   └── dashboard.py
│   │   │   ├── services/
│   │   │   │   ├── csv_parser.py           ← Multi-bank CSV parser + deduplicator
│   │   │   │   ├── merchant_normalizer.py  ← Canonical merchant name mapping
│   │   │   │   ├── recurrence_detector.py  ← Math-based cadence detection engine
│   │   │   │   ├── cancellation_directory.py ← Official verified cancellation guides
│   │   │   │   ├── ai_explainer.py         ← Gemini API + deterministic fallback
│   │   │   │   └── auth.py                 ← Supabase JWT + demo user tenant isolation
│   │   │   └── routers/
│   │   │       ├── auth.py
│   │   │       ├── imports.py              ← CSV upload, demo load, reset
│   │   │       ├── transactions.py
│   │   │       ├── recurring.py
│   │   │       ├── cancellation.py
│   │   │       └── dashboard.py
│   │   ├── tests/
│   │   │   ├── test_api.py                 ← End-to-end API tests (2 tests)
│   │   │   ├── test_csv_parser.py          ← CSV parsing tests (3 tests)
│   │   │   ├── test_merchant_normalizer.py ← Merchant normalization (4 tests)
│   │   │   └── test_recurrence_detector.py ← Confidence formula tests (2 tests)
│   │   ├── sample_data/
│   │   │   └── standard_bank_statement.csv
│   │   ├── venv/                           ← Python venv (already set up)
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── requirements.txt
│   │
│   └── web/                          ← Next.js 16 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css             ← ✅ UPDATED: overflow fix, custom scrollbar
│       │   │   ├── layout.tsx              ← ✅ UPDATED: better metadata, font swap
│       │   │   ├── page.tsx                ← ✅ NEW: Landing page (marketing)
│       │   │   ├── login/
│       │   │   │   └── page.tsx            ← ✅ NEW: Login/Signup page at /login
│       │   │   └── app/
│       │   │       └── page.tsx            ← ✅ NEW: Main dashboard at /app
│       │   ├── components/
│       │   │   ├── Navbar.tsx              ← ⚠️  NEEDS UI FIX (see below)
│       │   │   ├── DashboardSummary.tsx    ← Working
│       │   │   ├── SubscriptionCard.tsx    ← Working
│       │   │   ├── CancellationModal.tsx   ← Working
│       │   │   ├── CSVUploadModal.tsx      ← Working
│       │   │   ├── TransactionsTable.tsx   ← Working
│       │   │   ├── ManualTransactionModal.tsx ← Working
│       │   │   ├── AuthModal.tsx           ← Working (used inside /app)
│       │   │   └── SubscriptionEvidenceModal.tsx ← Working
│       │   ├── lib/
│       │   │   ├── api.ts                  ← Typed API client
│       │   │   └── supabase.ts             ← Supabase client (optional)
│       │   └── types/
│       │       └── index.ts                ← All TypeScript types
│       ├── Dockerfile
│       ├── .env.example
│       ├── next.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── vercel.json
│       └── postcss.config.mjs
│
├── docker-compose.yml
├── render.yaml                        ← Render Blueprint (backend deploy)
├── start.sh                           ← ✅ One-command startup script
├── spendleak.db                       ← SQLite dev database
├── README.md                          ← Public-facing README
└── AGENT_CONTEXT.md                   ← THIS FILE
```

---

## ✅ COMPLETED TASKS (All Done)

### Backend (100% Complete)
- [x] FastAPI app with CORS, health endpoint
- [x] SQLAlchemy models: User, Transaction, RecurringStream, CancellationCase
- [x] CSV parser: multi-bank format detection, amount parsing (₹/$, commas, negatives, brackets), deduplication via SHA-256 fingerprint
- [x] Merchant normalizer: canonical name mapping (Netflix→Netflix, NFLX→Netflix, etc.)
- [x] Recurrence detector: weekly/bi-weekly/monthly/quarterly/semi-annual/annual cadence detection with tolerance windows + confidence formula:
  - `Confidence = 0.30×Occurrences + 0.30×IntervalFit + 0.20×AmountConsistency + 0.10×MerchantMatch + 0.10×Recency`
- [x] Cancellation directory: official verified guides for Netflix, Spotify, Adobe CC, ChatGPT Plus, Google One, Cult.fit, and others
- [x] Gemini AI explainer with graceful fallback (deterministic text if no API key)
- [x] Supabase JWT auth + demo user tenant isolation via `X-Demo-User-Id` header
- [x] All routers: auth, imports, transactions, recurring, cancellation, dashboard
- [x] Demo data seeder (Netflix, Spotify, Adobe, ChatGPT, Google One, Electricity, Rent, Cult.fit, Amazon purchases)
- [x] **11/11 tests passing** — run with: `PYTHONPATH=apps/api ./apps/api/venv/bin/pytest apps/api/tests -v`

### Frontend (Partially Complete)
- [x] All 9 components built (Navbar, DashboardSummary, SubscriptionCard, CancellationModal, CSVUploadModal, TransactionsTable, ManualTransactionModal, AuthModal, SubscriptionEvidenceModal)
- [x] Typed API client (`src/lib/api.ts`) — all endpoints covered
- [x] All TypeScript types (`src/types/index.ts`)
- [x] **Landing page** created at `/` (`src/app/page.tsx`) — hero, how-it-works, features, trust strip, CTA
- [x] **Login page** created at `/login` (`src/app/login/page.tsx`) — sign in/up tabs, demo user quick-login, password show/hide
- [x] **Dashboard moved** to `/app` (`src/app/app/page.tsx`) — full dashboard with all tabs, modals, error handling
- [x] `globals.css` updated — `word-break: break-word` on `*`, custom scrollbar, smooth scroll
- [x] `layout.tsx` updated — better metadata, `font-display: swap`
- [x] Port conflict fix (`start.sh`) — kills ports 8000 and 3000 before starting
- [x] Offline connection resilience banner
- [x] Landing page syntax fix (escaped apostrophe in `src/app/page.tsx`)
- [x] **Navbar UI fix (`Navbar.tsx`):**
  - Brand logo wrapped in Next.js `Link` to `/`
  - Subtitle hidden on `< lg` screens and truncated
  - Responsive button labels ("Demo", "Upload") preventing overflow on 768px-1024px screens
  - User pill with truncated name and demo tag
- [x] **SubscriptionCard fix (`SubscriptionCard.tsx`):**
  - Truncated merchant name preventing badge collisions
  - Responsive flex-wrap button row avoiding clipping on small screens (< 380px)
- [x] **TransactionsTable fix (`TransactionsTable.tsx`):**
  - Table wrapped with `min-w-[640px]` and column width constraints for clean horizontal scroll
- [x] **DashboardSummary fix (`DashboardSummary.tsx`):**
  - Category breakdown text truncated with tooltips and `shrink-0` amounts
- [x] **Auth & Session Sync (`src/app/app/page.tsx`, `api.ts`, `login/page.tsx`, `AuthModal.tsx`):**
  - Supabase session checked on mount, updating username and token
  - Demo user display name and token persisted in `localStorage` across page reloads
  - Sign out handler implemented and connected to Navbar
- [x] **Branded 404 page created (`src/app/not-found.tsx`):**
  - Emerald/slate styling with direct links to Dashboard and Landing page
- [x] **Loading skeleton states:**
  - Added skeleton pulse placeholders on Dashboard and Subscriptions tabs during data load

---

## 🚀 Deployment & Production Readiness

- [ ] **Deploy Backend:**
  - Deploy to Render using `render.yaml`
  - Set environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`)
- [ ] **Deploy Frontend:**
  - Deploy to Vercel (set `NEXT_PUBLIC_API_URL` to backend service URL)

---

## 🚀 How to Run Locally

### One-Command Start (Recommended)
```bash
cd /home/parthow/Downloads/spending-leak-agent
chmod +x start.sh && ./start.sh
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Start
```bash
# Terminal 1 — Backend
cd /home/parthow/Downloads/spending-leak-agent
PYTHONPATH=apps/api apps/api/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend
cd /home/parthow/Downloads/spending-leak-agent/apps/web
npm run dev
```

### Run Tests
```bash
cd /home/parthow/Downloads/spending-leak-agent
PYTHONPATH=apps/api ./apps/api/venv/bin/pytest apps/api/tests -v
# Expected: 11 passed
```

---

## 🌐 URL Routes

| URL | What it is |
|-----|-----------|
| `http://localhost:3000/` | Landing/marketing page |
| `http://localhost:3000/login` | Login & Signup page |
| `http://localhost:3000/app` | Main dashboard (all 3 tabs) |
| `http://localhost:8000/docs` | FastAPI Swagger docs |
| `http://localhost:8000/health` | Health check → `{"status":"ok"}` |

---

## 🔑 Key Decisions & Architecture Notes

1. **No black-box AI for financial calculations.** Gemini is ONLY used to write plain English summaries. All amounts, intervals, and confidence scores are pure math.

2. **Multi-tenant via header:** Without Supabase configured, tenant isolation is done via `X-Demo-User-Id` header. The API client sends this automatically. Each user's data is completely isolated by `user_id` at the database query level.

3. **Demo data:** Load via the "Load Demo Scenario" button or `POST /api/v1/imports/load-demo`. It seeds 6 months of realistic transactions. Reset via "Reset" button or `DELETE /api/v1/imports/reset`.

4. **CSS framework:** Tailwind CSS v4 with the `@import "tailwindcss"` syntax (NOT `@tailwind base/components/utilities`). This is a breaking change from v3.

5. **Next.js 16 App Router:** All pages use the App Router. Client components have `'use client'` at the top. The `app/` dir has subfolders for routes: `app/login/page.tsx` = `/login`, `app/app/page.tsx` = `/app`.

6. **Python venv:** Already set up at `apps/api/venv/`. Always use `apps/api/venv/bin/python` or `apps/api/venv/bin/pip` — never global pip.

---

## 📌 Git State

```
Branch: master (outer repo)
Latest commit: ae41954 "Fix port conflict and add offline connection resilience banner"

apps/web is its own git repo (branch: main) with uncommitted changes:
  modified:  package.json, package-lock.json
  modified:  src/app/layout.tsx
  modified:  src/app/page.tsx       ← Now the landing page
  untracked: src/app/app/           ← New dashboard route
  untracked: src/app/login/         ← New login route
  untracked: src/components/        ← All components
  untracked: src/lib/
  untracked: src/types/
  untracked: Dockerfile, vercel.json
```

**Recommended next commit:**
```bash
cd /home/parthow/Downloads/spending-leak-agent/apps/web
git add -A
git commit -m "Add landing page, login page, fix UI layout and text overflow"

cd /home/parthow/Downloads/spending-leak-agent
git add -A
git commit -m "Add landing page, login page, /app route, UI fixes"
```

---

## 🐛 Known Issues (Active)

1. **Navbar overflow** — On 768–1024px screens, action buttons crowd and overflow. Fix described above in TO-DO #1.
2. **SubscriptionCard button row** — Overflows on very small screens. Fix: `flex-wrap` or overflow menu.
3. **TransactionsTable** — Needs `overflow-x-auto` wrapper for mobile.
4. **userName defaults** — `/app` page always shows "Parthasarathi" as username even after Supabase login. Fix: read session on mount.
5. **No 404 page** — Unbranded Next.js default.

---

*Generated by Antigravity AI · 25 Sep 2026 · Conversation: 874e3e52-10fd-4dab-a0c7-a339027f05ef*
