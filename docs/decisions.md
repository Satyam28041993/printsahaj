# Decision log

Decisions that are not derivable from the code, and the reasoning behind them.
Newest first. When a decision overrides the product specification, that is
stated explicitly so nobody builds from the superseded section.

---

## 2026-09-04 — Phase 0 runs before any product UI

**Decision:** finish Phase 0 — run the Step 2 checks over roughly 20 historical
PGPL jobs — before building login, signup, or any application interface.

**Considered:** building login and signup first, so the web app shell exists
while the checks are written.

**Reasoning:** the decision gate in product spec §12 says that if 20 real jobs
surface fewer than two or three genuine issues, the scope gets reconsidered.
Building authentication first means building before knowing whether there is
anything worth selling. `AGENTS.md` already forbids UI, storage, auth and
servers during Phase 0.

**Blocker:** sample files, not code. `samples/kalonji/` still needs the three
real PDFs from the DAILY KALONJI job.

---

## 2026-09-04 — The web application will be Next.js, not Flutter Web

**Decision:** the logged-in web application is built in the existing Next.js
project at `web/`, at `/login` and `/app` on the same domain.

**Supersedes:** product spec §9.1, which specifies Flutter Web for the web
layer. That section predates the marketing site being built.

**Reasoning:** `web/` is already Next.js 16 / React 19 / Tailwind 4 with an
established token system and a deployment path. One codebase, one domain, one
deploy. Adopting Flutter Web would mean maintaining two stacks and rebuilding
the design system for no benefit at the pre-press desk.

**Unchanged:** Flutter remains the intended choice for the Phase 3 Android
press-floor app. That is a different audience with different needs — camera
capture, offline operation, a stopped press and a sixty-second budget.

---

## 2026-09-04 — Colour: names and structure are checked, accuracy is not

**Decision:** the product verifies colour *identity and structure*, and states
plainly that it does not verify colour *accuracy*.

**In scope, deterministic:**

- Colour names and count — declared list against separation set, resolved
  through the per-customer mapping table (Gold → 617, P 7483 C → 7483)
- Ink sequence — declared order recorded, deviation flagged
- Ink coverage percentage per plate — useful for costing
- Barcode colour contrast — bars declared on a poor-contrast ground are the
  most common cause of a symbol that will not scan

**Out of scope, permanently:**

- Shade accuracy, ΔE, "is this the right green"
- Trap and overprint intent
- Ink sequence suitability

**Reasoning:** the PDF carries a colour *name*, not a printed result. The same
ink prints differently on Chromo than on film, and dot gain, anilox volume, ink
viscosity and press speed appear in no file. Measuring ΔE requires a calibrated
spectrophotometer under controlled illumination. A phone camera cannot do it and
neither can a scanner.

This audience knows the difference. A tool that claimed "colour verified" would
lose credibility on the checks it genuinely gets right. Every report must state
that colour accuracy was not checked — see spec §4.4 and §10.

**Future path:** if colour verification is genuinely wanted, it comes from
integrating a spectrophotometer and recording its readings. That is a Phase 4
decision with a hardware cost, not a software feature.

---

## 2026-09-04 — Customer artwork is never committed to git

**Decision:** every PDF and image under `samples/` is excluded from version
control. Only the `README.md` explaining what belongs there is tracked.

**Reasoning:** the GitHub repository is public, and these are real clients'
commercially sensitive files. They are not ours to publish.

**Consequence:** sample files exist only on the machine that needs them and are
not recoverable from git. They need a backup kept outside the repository.

---

## 2026-09-04 — Domain and hosting are in place

Confirmed: the domain and a hosting account both exist. Deployment is not a
blocker when the application work begins.

Note that `PrintSahaj-Master-Plan.md` still lists "check domain" as a pending
task and `docs/policies/` refers to `printsahaj.com` as though it were live.
Those references should be reconciled when the site is actually deployed.
