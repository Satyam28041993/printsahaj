# Kalonji — first test job

Job `CGM2026-27-1326`, DAILY KALONJI 100ML LABEL.

The job sheet says **6 COL + VARNISH** (7 units). The plate file has **6 pages**.
The varnish plate is missing.

This must be caught. Any change that misses it is a regression.

## In this folder

| File | What it is |
|---|---|
| `job.json` | Job sheet, typed in (in git) |
| `job-sheet.pdf` | Real sheet — add it locally; git will not take it |
| `separations.pdf` | 6 pages — add it locally |
| `composite.pdf` | Vendor proof — add it locally |

## Run

From `tools/artwork-verification/engine`:

```bash
.venv/bin/python -m printsahaj_verify ../samples/kalonji
```

The PDFs are customer files. They do not go in the public repo.
