#!/bin/sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/engine"
if [ ! -d .venv ]; then
  echo "Pehli baar setup ho raha hai..."
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt
echo "Tool start ho raha hai. Is window ko band mat karna."
echo "Chrome mein 127.0.0.1 kholna kaafi nahi — pehle yeh script chalo."
.venv/bin/python -m printsahaj_verify --serve
