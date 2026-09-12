# Phase 0 — plan and status

Phase 0 is a command-line script. No user interface, no database, no server.

Its purpose is **not** to build the product. It is to find out whether enough
real errors exist in past jobs to justify building one.

**Decision gate (spec §12):** if 20 historical jobs surface fewer than two or
three genuine issues, the scope gets reconsidered before anything else is built.

---

## Current status

| Piece | State |
|---|---|
| Virtual environment, PyMuPDF, pdfplumber | Done |
| `probe.py` — diagnostic reader for job PDFs | Done, tested on a real PDF |
| `models.py` — Finding, CheckResult, Certainty | Done |
| `constants.py` — physical constants | Done |
| Sample job PDFs in `tools/artwork-verification/samples/kalonji/` | **Missing — needed for later checks** |
| Job spec (`job.json`) | Done |
| Check A — plate count | Done, tested on a stand-in 6-page file |
| Reporter | Done |
| Vendor parser | Not started, waiting on the real PDFs |
| Checks B, F, E, C, D | Not started |

The tool lives in `tools/artwork-verification/`. The website only links to it.

---

## Why the probe comes before the parser

Separation PDFs differ from one plate vendor to the next — different headers,
different colorant naming, different page furniture. This is risk #1 in the
product spec's own register (§13).

Writing a parser before reading a real file produces a parser that works on
nobody's files. So the first thing done with a real job is to read it and look
at what is actually there.

The probe reports: page count, page sizes in millimetres, every text run with
its position and type height, spot ink names declared in the colour spaces, and
the producing application.

---

## Build order for the checks

Letters refer to product spec §4.2.

| # | Check | Why in this position |
|---|---|---|
| 1 | Job spec model — the digitised job sheet | Everything downstream compares against this record |
| 2 | **A — plate count** | The flagship catch. Declared 7 units, 6 separation pages, varnish absent |
| 3 | **B — colour name mapping** | A is incomplete without it; commercial names and production names differ |
| 4 | **F — header consistency** | Cheap, and catches pages mixed from two revisions — a silent, expensive failure |
| 5 | **E — geometry** | Pure arithmetic. Cylinder repeat ÷ 3.175 must be a whole tooth count |
| 6 | Reporter | Checks return structured results and never print |
| 7 | **C, D — text completeness and per-plate map** | Most expensive, most false positives. Only once the base is solid |

Checks 2 to 5 together catch both known defects in the Kalonji job: the missing
varnish plate, and "DAILY PHARMA" sitting on a single spot plate.

---

## Regression test #1

Job `CGM2026-27-1326`, DAILY KALONJI 100ML LABEL, Daily Pharma.

The approval sheet declares **6 COL + VARNISH** (7 units). The separation set
contains **6 pages**. The varnish plate is absent.

**Any change that stops catching this is a regression.**

Second known finding from the same job: the mandatory declaration
"DAILY PHARMA" exists on only one plate, P 7483 C. If that unit misprints or
runs dry, the label loses a legally mandatory field while looking otherwise
correct. This is an advisory finding, not a deterministic one.

---

## Next action

Put the three real PDFs into `tools/artwork-verification/samples/kalonji/`
— job sheet, separations, composite proof — then run:

```bash
cd tools/artwork-verification/engine
.venv/bin/python -m printsahaj_verify ../samples/kalonji
.venv/bin/python probe.py ../samples/kalonji
```

The output shows how this vendor writes its headers, where the ink names live,
and where the geometry can be read from. Checks B, F and E get written against
that. Check A already runs from the typed job sheet plus the page count.

Then repeat for roughly 19 more historical jobs. Kalonji builds the parser; the
rest answer the question Phase 0 actually exists to answer.

---

## Open items carried from spec §14

- [ ] Confirm what actually happened with the varnish plate on the Kalonji job
      — was it a separate later file, or genuinely missed?
- [ ] Collect separation PDFs from 5 or more different plate vendors to test
      parser robustness
- [ ] Confirm whether the colour mapping convention (Gold → 617, P 7483 C →
      7483) is vendor-specific or an industry convention
- [ ] Verify Legal Metrology minimum font heights against the current source
      text before encoding any of them
