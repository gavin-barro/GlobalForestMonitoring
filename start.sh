#!/usr/bin/env bash

# Resolve the directory this script lives in
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

# Store child PIDs so we can clean them up on exit
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Shutting down services..."
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID"  2>/dev/null
  wait "$FRONTEND_PID" 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

# ── Venv check ───────────────────────────────────────────
echo "Checking Python virtual environment..."
if [ ! -f "$BACKEND/.venv/bin/python" ]; then
  echo "No .venv found. Creating virtual environment..."
  python3 -m venv "$BACKEND/.venv" || { echo "ERROR: Failed to create venv. Is Python 3 installed?"; exit 1; }
  echo "Installing dependencies from requirements.txt..."
  "$BACKEND/.venv/bin/pip" install -r "$BACKEND/requirements.txt" || { echo "ERROR: Failed to install dependencies."; exit 1; }
  echo "Virtual environment ready."
else
  echo "Virtual environment found. Skipping setup."
fi

# ── Backend ──────────────────────────────────────────────
echo "Starting FastAPI backend https://localhost:8000"
cd "$BACKEND" || { echo "ERROR: backend folder not found at $BACKEND"; exit 1; }
.venv/bin/python -m uvicorn main:app --reload &
BACKEND_PID=$!

# ── Node deps check ──────────────────────────────────────
echo "Checking Node dependencies..."
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "No node_modules found. Running npm install..."
  cd "$FRONTEND" || { echo "ERROR: frontend folder not found at $FRONTEND"; exit 1; }
  npm install || { echo "ERROR: npm install failed. Is Node.js installed?"; exit 1; }
  echo "Node dependencies installed."
else
  echo "node_modules found. Skipping install."
fi

# ── Frontend ─────────────────────────────────────────────
echo "Starting Node frontend https://localhost:5173"
cd "$FRONTEND" || { echo "ERROR: frontend folder not found at $FRONTEND"; exit 1; }
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both services are running."
echo "Press Ctrl+C to stop everything."
echo ""

# Wait for both processes; exit if either dies unexpectedly
wait "$BACKEND_PID" "$FRONTEND_PID"