#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🛡️  Starting Spending-Leak Agent (Backend + Frontend)"
echo "=========================================================="

# Free ports 8000 & 3000 if occupied
echo "Checking and freeing ports 8000 and 3000..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# Start Backend (FastAPI)
echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
PYTHONPATH="$DIR/apps/api" "$DIR/apps/api/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 > /tmp/spendleak-api.log 2>&1 &
BACKEND_PID=$!

# Wait for backend healthcheck
echo "Waiting for API to initialize..."
for i in {1..20}; do
  if curl -s http://127.0.0.1:8000/health | grep -q "ok"; then
    echo "✅ FastAPI Backend is healthy on http://127.0.0.1:8000"
    break
  fi
  sleep 0.5
done

# Start Frontend (Next.js)
echo "Starting Next.js Frontend on http://localhost:3000..."
cd "$DIR/apps/web"
npm run dev > /tmp/spendleak-web.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "🎉 Spending-Leak Agent is live!"
echo "👉 Frontend App: http://localhost:3000"
echo "👉 Backend Docs: http://localhost:8000/docs"
echo "=========================================================="
echo "Logs:"
echo "  Backend:  tail -f /tmp/spendleak-api.log"
echo "  Frontend: tail -f /tmp/spendleak-web.log"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT TERM EXIT
wait
