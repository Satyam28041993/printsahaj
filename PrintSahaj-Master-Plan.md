# PrintSahaj — Master Plan

**Founder:** Satyam Singh
**Date:** 18 August 2026
**Status:** Name locked. Logo locked. Pre-build.

---

## 1. What PrintSahaj Is

**A digital platform that makes work simpler for India's printing and packaging industry.**

Not a single tool. A platform that starts with one tool and grows into the place printers go when they need something — a calculation, a verification, a supplier, a person.

**Brand:** PrintSahaj → evolving to **Sahaj** over time (as the platform outgrows "print")
**Positioning:** *Printing industry ka kaam sahaj.*
**Logo:** CMYK overlapping circles with a checkmark in the dark core — industry language + verification promise

### Why this exists
Indian converters run on paper, phone calls, and personal memory. The next generation entering these businesses is educated and system-oriented — but there is almost no technology built for them in India. Everything available is either enterprise-priced Western software or nothing at all.

### The strategic sequence
1. **Tools** bring traffic and prove value — they work with a single user, no network needed
2. **Verification** brings revenue — printers pay because it prevents losses
3. **Community and sourcing** bring lock-in — but only after there are users to connect

Most people try to build the community first. That fails. Tools first, network later.

---

## 2. Product Roadmap

### Phase 1 — Artwork & Plate Verification (NOW)
The first paid product. Full specification in `Artwork-Verification-System-Product-Spec.md`.

**Three steps:**

| Step | What | When it runs |
|---|---|---|
| **Step 1** | Incoming client artwork — spelling, compliance, mandatory declarations, barcode | Before quoting |
| **Step 2** | Separation PDF vs approved job spec — plate count, colour mapping, text completeness, geometry | Before plates are made ← **BUILD THIS FIRST** |
| **Step 3** | Printed sample vs approved artwork — mobile camera, plate presence check | At the press |

**Why Step 2 first:** cheapest to build (pure PDF, no camera, no OCR), highest saving per catch (before plate cost is spent), and a proven failure case already exists to test against.

### Phase 2 — Calculator Tools
Free SEO tools that bring traffic. Label rate calculator (already built), GSM to kg, roll length, ups per sheet, gear teeth to repeat, corrugated weight — all with Indian units, ₹, and Indian sheet sizes (19×29, 20×30, 23×36, 25×36, 28×40).

### Phase 3 — Blogs & WhatsApp Community
Content for internal linking and authority. WhatsApp group for feedback and validation — not an in-app community (zero build cost, users are already there, no loss if it doesn't work).

### Phase 4 — Sourcing / Connects
The "special paper" problem. Someone needs a material, posts a request, gets answers. Searchable, with history. Not a replacement for WhatsApp — its **memory**.

### Phase 5 — Hiring & Used Machinery
Deliberately last. Both need trust and a network that must exist first. Adding them early creates a cold-start problem that kills the platform.

---

## 3. The Validated Problem (Phase 1)

Real job: **CGM2026-27-1326 — DAILY KALONJI 100ML LABEL**, Daily Pharma, printed at PGPL.

| Document | Says |
|---|---|
| Client-approved job sheet (17-Apr-26) | **6 COL + VARNISH** — Yellow, Magenta, Cyan, Black, Gold, P 7483 C. Label 114×76mm. Chromo. Flexo. |
| Vendor separation PDF (20-Apr-26) | **6 pages** — Cyan, Magenta, Yellow, Black, 617, 7483 |
| Vendor composite proof | Header: `Col: 6` |

**The varnish plate is missing from the set.**

Caught only because two documents were placed side by side. This is not a spelling error — it is a **cross-document consistency failure**, and no careful reading of any single document catches it.

**Two more findings from the same job:**
- "DAILY PHARMA" — a legally mandatory declaration — exists on **only one plate** (P 7483 C). If that unit fails, the label loses a required field while looking otherwise perfect.
- The job sheet's sign-off boxes (QC Dept, Pre-Press Incharge, Manufacturing Incharge) are all **blank**. `Rev: 01, Date: 00-00-00`. The process exists on paper but paper cannot enforce it.

**And the vendor prints on their own proof:** *"Customers are advised to check plates carefully before printing."* Liability is transferred to the printer, who has no systematic way to discharge it.

### The one-line product definition
**A cross-document consistency engine that holds the job spec, the approved artwork, the plate separations, and the printed sample together, tells a human exactly where to look, and keeps an audit trail proving they looked.**

---

## 4. Who This Is For

**Primary — supply side (daily users)**

| Who | Why they care |
|---|---|
| **Estimators / pre-press** | Run the checks, catch errors before plates |
| **QC department** | Sign-off, audit trail, defence in disputes |
| **Production managers** | Their line stops, their reputation suffers |
| **Owners** | Pay for it because a rejected run costs lakhs |

**Geography — launch order:** Vasai-Virar → Palghar/Daman/Silvassa → Mumbai MMR → Virar-Bharuch corridor → national

**Key insight:** they search in English, talk in Hindi, and work at a **desktop**. Build desktop-first, dense, table-heavy. Not mobile-first.

---

## 5. Market Reality

### Verified national numbers
| Metric | Number |
|---|---|
| Flexo presses in India | ~1,800 |
| Active label converters | 250–350 (serious), 700–1,000 including small |
| LMAI members | 270+ |
| Printing/packaging units (all types) | ~2.5 lakh, 90% MSME |

### Vasai-Virar — actual identified converters
**Tier A (11 found, ~20-25 known to exist):**
Duralabel Graphics (✅ confirmed 8-col Weigang flexo) · Sonic Labels (9+ colour) · Mudrika Labels · Swapnali Labels · Dott Flexo Labels · Shree Krishna Labels · Shreenkin Labels · Barcom Industries · Modern Flexo · Primeprint · Label Tech System

All clustered in **Sativali–Waliv–Golani Naka**. 8-10 visits possible in one day.

### The competitor: GlobalVision
- Established category — proven the problem is real
- Pricing **$395–$795** (₹33,000–66,000/month) — 7-13× above target price
- Explicitly built for **large organisations, not small businesses**
- **English only.** No Devanagari, Gujarati, Tamil
- **No API** — cannot embed into a plate maker's workflow

**Window:** 2-3 comfortable years. Not 6 months. But not forever either — as AI lowers build cost, this gets easier for everyone.

---

## 6. Business Model

### Pricing — per plant, not per user
Per-user pricing makes people share one login, which destroys the audit trail — the most valuable feature.

| Tier | What | Price |
|---|---|---|
| Starter | Step 2 only, 50 jobs/mo, 1 plant | **₹2,500/mo** |
| Standard | Step 1+2, unlimited jobs, audit trail, reports | **₹5,000/mo** |
| Pro | + Step 3 APK, customer portal, multi-plant | **₹10,000/mo** |

- **Annual = 2 months free** (cash flow + lower churn)
- **Onboarding fee ₹10,000–15,000** (setup, colour mapping, vendor parser config, training)
- Target ARPU: **~₹4,000/mo = ₹48,000/year per customer**
- No free tier. 14-day trial, then card.

### Distribution — the plate maker channel
**Creative Graphics is pan-India.** Every separation PDF originates from a plate maker, who sends them to every converter in the country — and who bears the rework cost when errors are caught late.

**Pitch to them:** *"Less rework, fewer disputes, and a value-added service no competitor offers."* Not *"we catch your mistakes."*

- **White-label:** they offer it to their customers, you charge per tenant. One deal = 50-200 converters
- **Referral:** they introduce, you sell direct

Run this **alongside** direct sales, not instead of. They may refuse — the tool also exposes their errors.

### Honest ceiling
150 customers × ₹48,000 = **₹72 lakh ARR**. Excellent Indian small business. Not a unicorn. No VC will chase this — **which is exactly why nobody will push you out.**

Upside: adjacent verticals (pharma carton, flexible, corrugated — same engine, different rule packs) and export (Bangladesh, Sri Lanka, Middle East, Africa).

---

## 7. Timeline

| Period | What | Revenue |
|---|---|---|
| **Month 0-2** | Phase 0 script. No UI. Test on 30 past jobs | ₹0 |
| **Month 3-5** | Step 2 web app, used daily at PGPL only | ₹0 |
| **Month 6-8** | 3 pilot customers in Vasai at ₹1,000/mo token | ₹3,000/mo |
| **Month 9-12** | Pricing locked, 10-15 customers | ₹40-60k/mo |
| **Year 2** | Step 1 added, expand to Palghar/Daman/Silvassa, try plate maker channel | ₹1.5-2.5 lakh/mo |
| **Year 3** | Step 3 APK, national | ₹4-6 lakh/mo |

---

## 8. START HERE — Phase 0

**This is the only thing that matters right now.**

### What to build
**One Python script. No UI. No app. No Firebase. No database.**

**Input:** job spec fields (typed in) + composite PDF + separation PDF
**Output:** a printed list in the terminal

### What it checks
1. Plate count declared vs separation page count
2. Colour names from job sheet vs separation headers (with mapping table)
3. Text in composite but in no separation (won't print)
4. Text in separation but not in composite (unapproved addition)
5. Per-plate text map — which text sits on which plate
6. Single-plate dependency warning for mandatory declarations
7. Geometry — CLY ÷ 3.175 = whole number; label size × ups vs paper size
8. Header consistency (job code, date, `Col:`) across all pages

### Stack
Python + PyMuPDF (text with coordinates, page rendering) + pdfplumber (layout). That's it.

### Effort
**2-3 days.**

### How to test
Run it on **20-30 past PGPL jobs**. The Kalonji job is regression test #1 — the varnish gap must be caught.

### THE DECISION GATE
- **5+ genuine issues found across 30 jobs** → build Phase 1
- **Fewer than 3** → stop, rethink scope

This is the point of Phase 0. Not to build a product — **to find out whether there is one.**

### What you need to start
1. Composite + separation PDFs from the last 20-30 jobs (they're in your email)
2. The matching approval sheets
3. 2-3 days

---

## 9. Alongside Phase 0 (low effort, don't let it expand)

| Task | Effort |
|---|---|
| Check domain: `printsahaj.com` / `.in` / `.co` | 20 min |
| Trademark search — ipindia.gov.in, Class 9 + Class 42 | 30 min |
| Google search "PrintSahaj" for conflicts | 5 min |
| Logo → designer for SVG + variants (see §10) | ₹3-5k, 3-4 days |
| Landing page — Next.js + Tailwind, one page | 2-3 days |

**Landing page content:** what PrintSahaj is, who it's for, "verification tool coming soon", WhatsApp contact. Nothing more. No animations.

---

## 10. Logo Deliverables to Request

Current Gemini output is a **reference**, not final. Ask the designer for:

1. **SVG vector** (not PNG)
2. **Horizontal lockup** — mark left, wordmark right
3. **Vertical lockup** — mark above, wordmark below
4. **Icon only** — favicon, app icon, WhatsApp DP. **Thicker checkmark** for 32px legibility
5. **Monochrome** — black and white, single-colour printing. *(Essential — printers will ask, and having no answer looks amateur)*
6. **Exact colour codes** — CMYK, RGB, and spot equivalents

**Fixes needed on the current version:**
- Checkmark is slightly up-and-right of the true centre — must sit at the exact geometric intersection
- Yellow circle overlaps less than cyan/magenta — make all three overlaps symmetric
- Mark is small relative to wordmark — scale mark up ~15%

**Test:** view at 32px. If the checkmark disappears, thicken it.

---

## 11. Product Principles (do not break these)

1. **Never output PASS / APPROVED / COMPLIANT.** Only findings and counts. This protects both credibility and liability.
2. **Every report states what was NOT checked** — colour, trap intent, aesthetics.
3. **Compliance rules are never hardcoded.** They live in versioned JSON rule packs fetched from the server, each carrying its source and last-verified date. When a regulation changes, publish a new pack — no app update, no redeployment.
4. **Never show a barcode grade from a phone camera.** ISO 15416 grading needs calibrated hardware. Show "scanned" or "failed to scan" only.
5. **Data isolation is absolute.** Printers compete with each other. One leak ends the business. Offer on-premise for those who ask.
6. **Desktop first**, mobile second. The estimator works at a computer.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| **Separation PDFs vary by vendor** | Build a parser profile per vendor. Collect samples from 5+ plate makers early |
| **Printers won't upload customer artwork** | On-premise option, clear retention policy, auto-delete |
| **False positives destroy trust** | Never PASS/FAIL. Show confidence. Let users dismiss and remember it |
| **Rule packs go stale** | Provenance and last-verified date visible on every pack |
| **Building web + APK simultaneously** | Web first, complete. APK in Year 2 |
| **Scope creep across three steps** | Ship Step 2 alone. Resist everything else until it's in daily use |
| **⚠️ FOUNDER ATTENTION** | See below |

### The biggest risk is focus
Current active projects: Aivy, Flexora, PacTech Nexus, LeadTrack, SmartTrack, RuchiLeadBot, ATS website, Ayesha Packaging, Birla Opus token system — plus a full-time job.

**PrintSahaj needs ~10 hours/week, consistently, for 4 years.**

If it gets squeezed between everything else, it won't reach Year 2. **Recommendation: give the next 6 months to this alone. Pause the rest.** If 3 paying customers exist by Month 6, continue. If not, you've learned it in 6 months instead of wasting 3 years.

---

## 13. Why This One

Six ideas were considered: live counters, calculator hub, hiring platform, sourcing network, community, verification.

**Only one produced a real error, sitting in your own inbox, that you caught yourself.**

The others were good thinking. This is a real problem — one you have, your vendor disclaims, your customers share, and nobody in India is solving at a price MSMEs can pay.

**Start the script.**
