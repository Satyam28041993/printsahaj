#!/usr/bin/env bash
#
# Idempotent Cloud Agent setup for PrintSahaj.
#
# Prepares both development surfaces in the repo:
#   1. verifier/ — the Phase 0 Python CLI (PyMuPDF + pdfplumber)
#   2. web/      — the Next.js marketing landing page
#
# Safe to run repeatedly: it converges to the same state whether the VM is
# fresh or already partially set up.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# The default base image ships Python 3.12 but not the stdlib venv module.
# Install it once; apt is a no-op when the package is already present.
if ! dpkg -s python3.12-venv >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y --no-install-recommends python3.12-venv
fi

# --- verifier: Phase 0 Python CLI -------------------------------------------
cd "$repo_root/verifier"
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt

# --- web: Next.js landing page ----------------------------------------------
cd "$repo_root/web"
npm ci
