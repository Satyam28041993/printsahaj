# PrintSahaj verifier — Phase 0

A command-line script. No user interface, no database, no server.

The purpose of Phase 0 is not to build the product. It is to find out whether
enough real errors exist in past jobs to justify building one. Output goes to
the terminal and nowhere else.

See `AGENTS.md` at the repository root for the rules this code follows, and the
product specification for what each check is meant to compare.

## Setup

Already done once; repeat only on a fresh machine.

```bash
py -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
```

Python 3.11 or newer. Two dependencies: PyMuPDF for text with coordinates and
page rendering, pdfplumber for layout and table structure.

## Reading a job

```bash
.venv/Scripts/python.exe probe.py ../samples/kalonji
```

`probe.py` is a diagnostic, not a check. It reports what is inside each PDF —
page count, page sizes in millimetres, every text run with position and type
height, spot ink names declared in the colour spaces, and the producing
application.

It exists because separation PDFs differ from one plate vendor to the next.
Writing a parser before reading a real file produces a parser that works on
nobody's files.

Useful flag:

```bash
.venv/Scripts/python.exe probe.py ../samples/kalonji --text-limit 200
```

## Layout

```
verifier/
  probe.py                     entry point
  requirements.txt
  printsahaj_verify/
    constants.py               named physical constants
    models.py                  Finding, CheckResult, Certainty
    probe.py                   the diagnostic reader
```

Checks will land in `printsahaj_verify/checks/` once the real file structure is
known, and a reporter in `printsahaj_verify/reporting/`. Checks return
structured results and never print; the reporter formats them.

## What this will never output

`PASS`. `APPROVED`. `FAIL`. `COMPLIANT`.

The tool reports findings and counts, and states what it did not check. A human
makes the decision, and the report records that they did. This is a product
rule, not a preference — see `AGENTS.md`.
