#!/bin/sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/engine"
if [ ! -d .venv ]; then
  echo "First-time setup..."
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt
echo "Starting the tool. Do not close this window."
echo "Opening 127.0.0.1 in the browser is not enough — run this script first."
echo "Optional: set PRINTSAHAJ_GEMINI_API_KEY to read wording on PNG labels."
.venv/bin/python -m printsahaj_verify --serve
