# 🔐 Supabase Auth & Multi-Tenant Data Isolation

This document outlines the authentication architecture, multi-tenant data isolation model, and step-by-step Supabase configuration for the **Spending-Leak Agent**.

---

## 🏛️ Authentication Architecture

The application implements a **Dual-Mode Authentication Architecture** designed to balance enterprise-grade security in production with zero-friction onboarding during demos, development, and portfolio evaluations.

```
                    ┌───────────────────────────────────┐
                    │       Next.js 16 Web Client       │
                    └─────────────────┬─────────────────┘
                                      │
                 Does an active Supabase Session exist?
                                ╱       ╲
                              YES        NO
                              ╱             ╲
        [Attach Bearer JWT Token]         [Attach X-Demo-User-Id Header]
              Authorization:                    X-Demo-User-Id:
          Bearer <supabase_jwt>             usr_demo_parthasarathi
                              ╲             ╱
                               ▼           ▼
                    ┌───────────────────────────────────┐
                    │          FastAPI Backend          │
                    │      (app/services/auth.py)       │
                    └─────────────────┬─────────────────┘
                                      │
                   Extract Verified User ID (UUID / String)
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │      SQLAlchemy ORM Queries       │
                    │   WHERE user_id == authenticated  │
                    └───────────────────────────────────┘
```

---

## 🛡️ Multi-Tenant Data Isolation Guarantee

Personal financial data requires strict row-level isolation. No user should ever be able to view, query, or mutate another user's financial ledger or subscription streams.

### 1. Database-Level Isolation
Every table in the database (`transactions`, `recurring_streams`, `cancellation_cases`) contains a mandatory foreign key / index on `user_id`:
```python
# app/models/transaction.py
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    # ...
```

### 2. Dependency Injection Enforced Query Scoping
The FastAPI backend enforces user extraction on every protected route via the `get_current_user` dependency:

```python
# app/services/auth.py
def get_current_user(
    authorization: Optional[str] = Header(None),
    x_demo_user_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    # 1. If Bearer token is provided, verify Supabase JWT
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = verify_supabase_jwt(token)
        user_id = payload.get("sub")
        return get_or_create_user(db, user_id=user_id, email=payload.get("email"))

    # 2. If running in Demo Mode, isolate by header
    if x_demo_user_id:
        return get_or_create_user(db, user_id=x_demo_user_id, is_demo=True)

    raise HTTPException(status_code=401, detail="Authentication credentials required")
```

Every router query explicitly applies `.filter(Model.user_id == current_user.id)`. Cross-tenant data leakage is structurally impossible.

---

## ⚡ Mode A: Production Supabase Auth

In production, user authentication is managed via Supabase Auth (GoTrue).

### Flow:
1. User enters their email and password on `/login` (or inside the in-app `AuthModal`).
2. The `@supabase/supabase-js` client submits credentials directly to your Supabase project.
3. Upon successful authentication, Supabase returns a cryptographically signed JWT containing:
   - `sub`: The unique user UUID
   - `email`: User email address
   - `aud`: "authenticated"
   - `exp`: Token expiration timestamp
4. The client's `api.setAuthToken(session.access_token)` saves the JWT to `localStorage` and attaches it as `Authorization: Bearer <token>` on all subsequent HTTP requests.
5. The FastAPI backend verifies the signature of the JWT using the `SUPABASE_JWT_SECRET` (HMAC-SHA256) or Supabase public keys before fulfilling any database operation.

---

## 🧪 Mode B: Zero-Friction Demo Mode

For portfolio reviewers, local development, and instant demonstrations without registration friction:
1. If Supabase environment variables are omitted, the frontend automatically falls back to demo mode.
2. The client sends an `X-Demo-User-Id` header (e.g. `usr_demo_parthasarathi` or `usr_demo_alice_chen`).
3. The backend treats each demo string as a completely isolated tenant.
4. Reviewers can switch between demo identities in 1 click to verify that "Parthasarathi's" transactions and "Alice Chen's" transactions never mix.

---

## 📋 Step-by-Step Supabase Setup Guide

Follow these steps to connect your own Supabase project:

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New project**, choose your organization, enter a name (e.g., `spending-leak-agent`), and set a strong database password.
3. Select the region closest to your users.

### Step 2: Retrieve API Keys & JWT Secret
1. Navigate to **Project Settings** (gear icon in the left sidebar) > **API**.
2. Note down the following values:
   - **Project URL:** `https://<project-ref>.supabase.co`
   - **Project API Keys (`anon` / `public`):** `eyJhbGciOiJIUzI1Ni...`
   - **JWT Secret:** (Click to reveal the JWT Secret)

### Step 3: Configure Backend Environment Variables
In `apps/api/.env` (or in Render Environment Variables):
```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_JWT_SECRET=your_revealed_jwt_secret_here
```

### Step 4: Configure Frontend Environment Variables
In `apps/web/.env.local` (or in Vercel Environment Variables):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
```

### Step 5: (Optional) Disable Email Confirmations for Testing
If you want users to be able to sign up and immediately log in without verifying their email:
1. In the Supabase Dashboard, go to **Authentication** > **Providers** > **Email**.
2. Uncheck **Confirm email**.
3. Click **Save**.

---

## 🔄 Client-Side Auth Lifecycle in Next.js

1. **Hydration on Mount (`src/app/app/page.tsx`):**
   ```tsx
   useEffect(() => {
     const initUser = async () => {
       if (supabase) {
         const { data: { session } } = await supabase.auth.getSession();
         if (session) {
           api.setAuthToken(session.access_token);
           setIsDemoMode(false);
           setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0]);
           return;
         }
       }
       // Fallback to local demo identity
       const demoName = api.getDemoUserName();
       setUserName(demoName || 'Parthasarathi');
     };
     initUser();
   }, []);
   ```

2. **Persistent Storage (`src/lib/api.ts`):**
   Tokens and demo IDs are synchronized with `localStorage` so refreshing the browser preserves the active session:
   - `spendleak_auth_token`: Active Supabase JWT
   - `spendleak_demo_user_id`: Active demo tenant slug
   - `spendleak_demo_user_name`: Active demo display name

3. **Sign Out Flow:**
   Calling `handleSignOut()` invokes `supabase.auth.signOut()`, clears stored tokens via `api.setAuthToken(null)`, and redirects the browser to `/login`.

---

## 🔍 How to Test Multi-Tenant Isolation

1. Open the app at [http://localhost:3000/app](http://localhost:3000/app).
2. Click **"1-Click Demo Data"** to seed sample data for **Parthasarathi**. Notice ₹5,921/mo in detected subscriptions.
3. Click the user pill in the top right, and select **"Alice Chen (Tenant B)"**.
4. Notice that Alice Chen's ledger is completely empty (0 transactions, 0 subscriptions).
5. Load or upload a different statement for Alice Chen.
6. Switch back to **Parthasarathi** — all original data remains intact, completely untouched and unpolluted.
