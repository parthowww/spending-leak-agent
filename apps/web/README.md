# 💻 Spending-Leak Agent — Frontend Web App

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 personal finance web client designed for responsive, explainable subscription tracking and cancellation navigation.

---

## 🏛️ Application Architecture

```
apps/web/
├── src/
│   ├── app/                                # Next.js 16 App Router
│   │   ├── page.tsx                        # 🌟 Marketing Landing Page (Route: /)
│   │   ├── app/
│   │   │   └── page.tsx                    # 📊 Main Application Dashboard (Route: /app)
│   │   ├── login/
│   │   │   └── page.tsx                    # 🔐 Sign In / Sign Up & Demo Switcher (Route: /login)
│   │   ├── not-found.tsx                   # 🚫 Branded 404 Error Page
│   │   ├── layout.tsx                      # Root HTML layout with Geist font & metadata
│   │   └── globals.css                     # Tailwind CSS v4 theme, custom scrollbar & word-break
│   ├── components/                         # Modular React 19 UI components
│   │   ├── Navbar.tsx                      # Header with brand link, tabs, actions & responsive drawer
│   │   ├── DashboardSummary.tsx            # KPI cards, upcoming renewals, category spend, AI briefing
│   │   ├── SubscriptionCard.tsx            # Subscription cards with actions, confidence, and cadence
│   │   ├── CancellationModal.tsx           # Official verified guides, email generator & case tracking
│   │   ├── SubscriptionEvidenceModal.tsx   # Mathematical confidence breakdown & historical debits
│   │   ├── CSVUploadModal.tsx              # Statement file upload with sample bank guidelines
│   │   ├── TransactionsTable.tsx           # Filterable, searchable raw transaction ledger
│   │   ├── ManualTransactionModal.tsx      # Modal for single manual transaction entry
│   │   └── AuthModal.tsx                   # Multi-tenant switcher & Supabase authentication modal
│   ├── lib/
│   │   ├── api.ts                          # Type-safe API client with localStorage tenant persistence
│   │   └── supabase.ts                     # Optional Supabase client initialization
│   └── types/
│       └── index.ts                        # TypeScript interfaces (Streams, Transactions, Guides, KPIs)
├── package.json                            # Scripts & dependencies
├── next.config.ts                          # Next.js configuration
├── postcss.config.mjs                      # PostCSS plugins
└── vercel.json                             # Vercel deployment specification
```

---

## 📄 Application Pages Breakdown

### 1. Landing Page (`/` — `src/app/page.tsx`)
- **Purpose:** Public-facing marketing and educational entrypoint.
- **Features:**
  - Hero banner with headline, primary CTA ("Load Demo — See It in Action"), and upload shortcuts.
  - Interactive preview card cluster showcasing real detected subscriptions (Netflix, Spotify, Adobe, ChatGPT, etc.) with real-time confidence scores and savings figures.
  - "How It Works" 4-step workflow (Upload Statement → Math Recurrence Detection → Review Leaks → Cancel Safely).
  - Feature highlights grid (CSV Parser, Savings Estimator, Verified Guides, Explainable Math).
  - Security & Privacy trust strip highlighting zero bank credential storage and client-side memory parsing.
  - Responsive header and footer with direct links to `/login` and `/app`.

### 2. Main Dashboard (`/app` — `src/app/app/page.tsx`)
- **Purpose:** The authenticated operational workspace for personal finance analysis.
- **Three Core Tabs:**
  1. **Dashboard Tab:**
     - High-level KPIs (Total Monthly Spend, Annualized Commitment, Potential Annual Savings, Review Queue).
     - AI Spending Opportunity & Executive Briefing (plain-English summary of recurring habits).
     - Upcoming Expected Renewal Charges timeline with countdowns (e.g., "Due in 3 days", "Due today").
     - Category breakdown progress bars with auto-calculated percentage shares.
     - Top flagged subscription preview cards with one-click actions.
  2. **Subscriptions Tab:**
     - Full grid of all detected recurring streams.
     - Multi-level filtering by review status (`Needs Review`, `Kept`, `Cancelled`, `Dismissed`) and category.
     - Action buttons:
       - **Keep:** Confirms the subscription is actively desired.
       - **Cancel / Review:** Opens verified cancellation steps and email drafter.
       - **Not a Sub:** Dismisses false positives / one-off purchases.
       - **Remind:** Snoozes the service and sets a reminder before the next renewal cycle.
       - **Evidence & AI:** Opens mathematical audit drawer with confidence formula breakdown and raw debit transaction history.
  3. **Transactions Tab:**
     - Paginated bank transaction ledger with search by merchant name or raw description.
     - Category filter dropdown.
     - Direction indicators (Credit vs Debit).
     - Single-click transaction deletion with automatic recurrence recalculation.
     - "Add Transaction" modal trigger for manual entry.
- **Connection Resilience:** Displays an informative banner with retry logic if the backend server is unreachable.
- **Loading Skeletons:** Animated skeleton UI during initial network fetch.

### 3. Sign In / Sign Up Page (`/login` — `src/app/login/page.tsx`)
- **Purpose:** Unified authentication and demo-user selection screen.
- **Features:**
  - Tabbed interface between **Sign In** and **Sign Up**.
  - Password visibility toggle (eye icon).
  - Optional Supabase authentication support.
  - **1-Click Demo User Switcher:** Instant login as "Parthasarathi" (Primary Demo) or "Alice Chen" (Tenant B) without typing passwords, demonstrating tenant data isolation.
  - Custom demo username input for testing custom isolated workspaces.

### 4. Custom 404 Page (`/_not-found` — `src/app/not-found.tsx`)
- **Purpose:** Graceful error page for invalid URLs.
- **Features:**
  - Emerald and slate design system styling.
  - Direct quick navigation buttons back to **Dashboard (`/app`)** and **Home (`/`)**.

---

## 🧩 UI Components & Modals

| Component | File Path | Functionality |
| :--- | :--- | :--- |
| **Navbar** | `src/components/Navbar.tsx` | Header bar with clickable logo, tab navigation, responsive demo & upload buttons, user avatar pill, and mobile bottom navigation. |
| **DashboardSummary** | `src/components/DashboardSummary.tsx` | Visual KPI stat boxes, upcoming charges schedule, and category breakdown with truncation tooltips. |
| **SubscriptionCard** | `src/components/SubscriptionCard.tsx` | Individual service card with annual cost, cycle amount, confidence percentage, next renewal date, and 5 action triggers. |
| **CancellationModal** | `src/components/CancellationModal.tsx` | Step-by-step verified cancellation manuals, official direct portal URLs, refund policies, and AI formal email drafter. |
| **SubscriptionEvidenceModal** | `src/components/SubscriptionEvidenceModal.tsx` | Complete audit trail displaying the 5 mathematical weights of the confidence formula and historical debit ledger rows. |
| **CSVUploadModal** | `src/components/CSVUploadModal.tsx` | Drag-and-drop CSV uploader with bank compatibility guidelines (HDFC, SBI, ICICI, etc.) and error feedback. |
| **TransactionsTable** | `src/components/TransactionsTable.tsx` | Responsive ledger table with `min-w-[640px]` horizontal scroll container, search bar, and category filters. |
| **ManualTransactionModal** | `src/components/ManualTransactionModal.tsx` | Quick form to input a date, amount, description, and category. |
| **AuthModal** | `src/components/AuthModal.tsx` | Tenant isolation modal enabling instant user switching and Supabase cloud auth login. |

---

## 🎨 Styling & Design Tokens

- **Framework:** Tailwind CSS v4 using modern `@import "tailwindcss"` engine.
- **Color Palette:**
  - Primary Brand: Emerald (`emerald-600`, `emerald-700`, `emerald-50`)
  - Accent / Warnings: Amber (`amber-50`, `amber-600`, `amber-800`)
  - Danger / Cancellations: Rose (`rose-50`, `rose-600`, `rose-800`)
  - AI & Assistive Insights: Indigo / Purple (`indigo-50`, `indigo-600`)
  - Neutral / Text: Slate (`slate-900`, `slate-700`, `slate-500`, `slate-100`)
- **Typography:** Geist font family with `font-display: swap` for maximum performance.
- **Layout Safety:** Global `word-break: break-word` and overflow protection to prevent horizontal viewport clipping on mobile devices.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
cd apps/web
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
# Backend API URL (default: http://localhost:8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized production build using Next.js Turbopack.
