#!/bin/sh
set -e
cd "$(dirname "$0")/engine"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt
echo "Tool: http://127.0.0.1:8765"
.venv/bin/python -m printsahaj_verify --serve
