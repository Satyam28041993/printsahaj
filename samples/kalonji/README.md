# Kalonji — regression test #1

Job `CGM2026-27-1326`, DAILY KALONJI 100ML LABEL, Daily Pharma, printed by
Prakruti Graphics.

This is the job the whole product was built around. It has a known defect: the
approval sheet declares **6 COL + VARNISH** (7 units) and the separation set
contains **6 pages**. The varnish plate is absent.

**Any change that stops catching this is a regression.**

## Files to put here

These are not in git — see below. Copy them in from the original emails.

| Filename | What it is | Where it came from |
|---|---|---|
| `job-sheet.pdf` | Client-approved artwork + job specification sheet | Email attachment, 17 Apr 2026 |
| `separations.pdf` | Vendor separation set, 6 pages, one per plate | Email attachment, 20 Apr 2026 |
| `composite.pdf` | Vendor composite proof, carries the `Col: 6` header | Same email as the separations |

Names do not have to match exactly — the probe reads whatever PDFs it finds in
this folder.

## Reading them

From the `verifier/` folder:

```bash
.venv/Scripts/python.exe probe.py ../samples/kalonji
```

That prints what is inside each file: page count, page sizes in millimetres,
every text run with its position and type height, any spot ink names declared
in the colour spaces, and the producing application.

Nothing is checked yet. The probe exists so the parser is written against the
real structure of this vendor's files rather than a guess.

## Why these files are not committed

This repository is public. These PDFs are a real customer's artwork and are
commercially sensitive — they are not ours to publish. `.gitignore` excludes
every PDF and image under `samples/`, so they stay on the machine that needs
them and nowhere else.

Keep a backup outside the repo. Nothing here is recoverable from git.

## Other jobs

Phase 0 needs roughly 20 historical jobs, not just this one. Put each in its
own folder alongside this one:

```
samples/
  kalonji/
  <next-job>/
  <another-job>/
```

The decision gate is in the product spec, §12: if 20 real jobs surface fewer
than two or three genuine issues, the scope gets reconsidered before anything
else is built.
