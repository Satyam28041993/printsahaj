# PrintVerify (engine)

These instructions apply **only** to `tools/artwork-verification/`. They do not govern the PrintSahaj marketing website in `web/`.

PrintVerify is a verification system for the Indian printing and packaging industry. It compares a print job's approved artwork, its plate separation PDFs, and its job specification against each other, and reports inconsistencies to a human.

Full product spec: `Artwork-Verification-System-Product-Spec.pdf` (plain-text dump at repo root: `artwork_spec.txt`). Read it before implementing any check.

The verification **tool** is not the website. This folder is the tool. The website only links to it (`tool.printsahaj.com` / `/tools/artwork-verification`).

A local/cloud desk (`printsahaj_verify/server.py`, `static/desk.html`) already exists. Maintain it. Do not fold it into the marketing site. New **check** logic still follows the rules below.

## Current phase (checks)

Phase 0 purpose remains: find real errors in past jobs. Check functions stay independently testable. Do not add OpenCV, OCR, or ML libraries without asking. No new Python packages without asking.

## Stack

- Python 3.11+
- PyMuPDF (fitz) — text extraction with coordinates, page rendering
- pdfplumber — layout and table structure
- Standard library for everything else

## Code standards

- Type hints on all functions
- Docstrings on all public functions
- No magic numbers — named constants (e.g. `CIRCULAR_PITCH_MM = 3.175`)
- One check per function, each independently testable
- Checks return structured results, never print directly — a separate reporter formats output
- Fail loudly on malformed input; never silently skip a check

## Non-negotiable product rules

These are product decisions, not preferences. Do not override them.

1. **Never output PASS, APPROVED, FAIL, or COMPLIANT.** Output findings and counts only. The tool assists a human decision; it does not make one.
2. **Every report states what was NOT checked** — colour accuracy, trap and overprint intent, aesthetics.
3. **Distinguish certainty levels.** Deterministic findings (plate count mismatch) and advisory flags (same text on two plates) must be visually separate in output.
4. **Compliance rules are never hardcoded.** They belong in versioned JSON rule packs loaded at runtime. Not in Python source.
5. **Never claim a barcode grade.** Only "decoded" or "failed to decode". ISO 15416 grading requires calibrated hardware.

## Working style

- Explain what you are about to do before writing code
- If a check's logic is ambiguous, ask rather than guess — a wrong check in a verification tool is worse than a missing one
- Prefer boring, readable code over clever code
- Write the test case first when a real sample PDF is available

## Test data

`tools/artwork-verification/samples/kalonji/` contains a real job with a known defect: approval sheet declares "6 COL + VARNISH" (7 units), separation PDF has 6 pages. The varnish plate is missing.

**This is regression test #1. Any change that stops catching it is a regression.**
