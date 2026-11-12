# Build prompt — PrintSahaj flexible-packaging calculators

Give this file to Claude (or any implementer) as the brief. **Read the sibling docs first. Docs and formulas before any UI. Work on a branch and open a pull request. Do not merge.**

---

## 1. Role / Goal

You are a senior engineer building **free, accurate flexible-packaging costing calculators** on the PrintSahaj marketing website. Your job is maximum accuracy, not speed. You will implement **MVP tools 1–4** (and, as a stretch, a quote PDF with a lead form) against the formulas and golden tests in this folder. You will **not** invent rates, **not** silently guess missing data, and **not** ship Phase 2 or Phase 3 in the first PR.

If you have any doubt — a formula, a density, a wastage convention, where leads should go, how Excel-mode should sit next to the physically correct method — **STOP and ask Satyam questions before assuming.**

---

## 2. Context

- **PrintSahaj** (Satyam Singh, founder) is a technology and digital-solutions brand with deep expertise in printing and packaging. See repo-root `AGENTS.md`. Public language: understand the problem, build the system, make the work simpler. Do not describe PrintSahaj as only a verification product (that is PrintVerify).
- **Audience:** Indian flexible-packaging **converters** (gravure and flexo) and their **buyer** customers. Owners know their own film rates, conversion charges and margins; we give correct formulas, a film library, and labelled defaults.
- **Business goal:** lead generation on printsahaj.com, leading later to **Flexora** (ERP). Free site: calculators + optional quote PDF. **Not** on the free site: job cards, CRM, stock, production tracking (those belong in Flexora).
- **This folder is research and a brief only.** A Google Drive copy already exists in [Printsahaj Business Operation](https://drive.google.com/drive/folders/1SxnQpQDsOnyW10KLC-0nPEgllgsmNRi1) ([Doc](https://docs.google.com/document/d/1lSM9h5H0dtw9lzXvqs5nKVdUVk7GFquWHbbZcJyR-NM/edit?usp=drivesdk), [PDF](https://drive.google.com/file/d/1xqfOhtWJM3aeClCdx4Eogg0tocr6FRqJ/view?usp=drivesdk)). Use the repo files as the source of truth while building; the Drive copies are for Satyam’s own archive.

---

## 3. Read first (in this order)

All paths are from the repository root, branch `docs/flex-pack-calculators` (or `main` once merged):

1. `docs/flexible-packaging-calculators/README.md` — index and existing stack.
2. `docs/flexible-packaging-calculators/01-research.md` — densities, adhesive/ink GSM, Indian structure presets, pouch-area formulas, wastage, conversion, Kanodia cylinders, GST/HSN, worked stand-up example, competitor gap.
3. `docs/flexible-packaging-calculators/02-reference-excel-analysis.md` — Indian printer Excel, step-by-step logic, **all six jobs’ golden numbers**, known gaps. Open `docs/flexible-packaging-calculators/reference/printer-costing-sample.xls` (and the CSV dumps in `reference/`) and confirm the numbers yourself.
4. `docs/flexible-packaging-calculators/03-tool-list.md` — 14-tool plan and market URLs.
5. Existing website calculators (do not break them):
   - `web/src/app/(pages)/calculators/page.tsx`
   - `web/src/lib/labelRate.ts`
   - `web/content/tools.ts`
   - `web/package.json`, `web/CLAUDE.md`, `web/AGENTS.md`, repo-root `AGENTS.md`
   - `.cursor/rules/website-architecture.mdc` and the `print-sahaj-website` skill if you work in Cursor.

Then **do your own research** to verify and, if needed, extend densities and formulas (film TDS, RollSpec, GSMCalculator, Kanodia, CBIC/GST compilations, etc.). Cite every source you rely on in a short `docs/flexible-packaging-calculators/04-verification-notes.md` (create that file). If a number in our docs disagrees with a primary TDS, **ask Satyam** and document both; do not silently overwrite a golden test.

---

## 4. Scope

**This PR (MVP):**

- Tool 1 — Structure / GSM / Yield
- Tool 2 — Pouch Cost (3SS, center-seal/pillow, stand-up; zipper/spout add-ons)
- Tool 3 — Cylinder / plate cost spread (first order vs repeat)
- Tool 4 — Ink and adhesive consumption (physically correct dry/wet mass)
- Shared **owner-editable rate book** (labelled example defaults; persist at least in `localStorage`; login-to-save can wait)
- Unit tests for Excel Job 1–6 (Excel-compatible path) and for the researched stand-up worked example (product path)
- Register the new tools in `web/content/tools.ts` and keep the five existing calculator tabs working

**Stretch, only if MVP is solid:** Quote PDF (PrintSahaj logo, GST shown separately, first vs repeat, quantity slabs) behind a lead form (name, WhatsApp, company, city). **Before** wiring any backend or email, ask Satyam where leads should go. If that is unanswered, ship the on-screen result and a client-side “prepare PDF” stub, and stop.

**Later phases — list in the UI as “coming”, do not build now:** tools 5–14 in `03-tool-list.md` (roll OD/length, web/slit, pouch volume, unit converters, flexo vs gravure break-even, label/rollstock extension, barrier selector, recyclability helper, MOQ helper). Do not regress the live label-rate tool.

**Out of scope:** Flexora features; inventing a conversion ₹/kg schedule; presenting Innoform-style OTR as a certified lab result; inventing GST advice beyond “default 18%, confirm HSN with your CA”.

---

## 5. Exact formulas and logic

Implement math in **pure TypeScript** under `web/src/lib/flexpack/` (mirror `web/src/lib/labelRate.ts`). Keep UI free of one-off arithmetic.

### 5.1 Structure / GSM (product path — default)

```
layer_GSM        = micron × density          // or measured GSM override
                   // paper: enter mill GSM, never density
                   // MET: base film GSM + optional metal add-on (research: about 0.5–1.0 GSM; label the assumption)
total_GSM        = Σ film_GSM + Σ dry_adhesive_GSM + dry_ink_GSM
                   // 2-layer: 1 bond; 3-layer: 2 bonds; 4-layer: 3 bonds
yield_m2_per_kg  = 1000 / total_GSM
cost_per_m2      = Σ (layer_GSM / 1000 × that_layer_₹_per_kg)   // dry coatings too
cost_per_kg      = cost_per_m2 / (total_GSM / 1000)
```

Library **starting** densities (owner-editable; prefer TDS or measured GSM): PET 1.40, BOPP plain 0.905 (warn that matte/cavitated can be 0.84), CPP 0.90, LDPE 0.922, LLDPE 0.92, HDPE 0.955, Alu foil 2.70, BOPA 1.15, EVOH grade-specific (e.g. 1.14). Adhesive dry starting ranges: solvent-based ~2.0–2.8 GSM/bond (Cytech); solventless ~1.2–2.8; GSMCalculator default 2.5. Only **dry** mass belongs in GSM. Solvent-based wet kg = dry kg ÷ solids %. Solventless: wet = dry.

Ship Indian **presets** from `01-research.md` (chips PET/MET PET/PE, coffee/pharma PET/Alu/PE, retort PET/Alu/BON/CPP, biscuits BOPP/BOPP, etc.), fully editable.

### 5.2 Pouch area (product path)

Use **outer** sizes that already include seal lands (typical 5–10 mm; retort 8–10 mm). If the user enters inside dimensions, add seals first. Do **not** add seals twice. W, H, G in mm; A in m².

```
3-side seal:     A = 2 × W × H / 1_000_000
Center-seal:     web = 2 × face + total_back_seal + total_edge_trim
                 A = web × repeat / 1_000_000     // fin vs lap is an owner pick
Stand-up:        A = W × (2H + G) / 1_000_000     // G is FULL unfolded depth (40+40 folded → 80)
                 slit ≈ 2H + G + 2 × edge_trim;   repeat ≈ W
Side-gusset:     A ≈ H × (2W + 2G) / 1_000_000    // planning only
Flat-bottom / quad: do NOT invent a formula — owner enters dieline cm²
```

Zipper, spout, valve: **₹ (and optional grams) per piece**, not film layers. Film grams = A × total_GSM. Pouches/kg (film only) = 1000 / grams.

**Do not** copy GSMCalculator’s one-panel area (W × H) for a two-panel pouch.

### 5.3 Slit, trim, wastage (product path)

Layout trim is purchased film, **not** a waste percent:

```
purchased_area = (slit_width_mm × repeat_mm) / 1_000_000    // standy: slit = 2H+G+2×trim
good_kg        = quantity × purchased_area × total_GSM / 1000
input_kg       = good_kg / (1 − run_waste) + setup_metres_converted_to_kg
```

Compound waste **last machine first**. Simple mode may use one combined 3–5% (GSMCalculator “typical”), labelled as a starting range, not a benchmark. Suggested starting ranges: print 2–4%, lam 1–3%, slit 1–2%; pouching example 4% only if clearly labelled illustrative (RollSpec).

Default edge trim 10 mm/side is a **labelled example** (RollSpec), not a constant. Warn if gravure circumference is not a whole multiple of the repeat.

### 5.4 Conversion, cylinder, add-ons, packing, profit, GST (product path)

- **Conversion:** empty, owner-entered lines — printing (gravure or flexo), lamination, slitting, pouching — as ₹/kg and/or ₹/1,000. There is **no** trustworthy published Indian ₹/kg schedule. Demo numbers must say **Example**.
- **Cylinder / plate:** `cost = length_cm × circumference_cm × ₹_per_cm² × colours`. Default ₹2.10/cm² below 750 mm circumference and ₹2.30 above (Kanodia Gravure, retrieved 12 Nov 2026; their web formula block is a little garbled — use area × rate). Flexo plate default ₹1.50/cm² is an Alliance **example**. Show **first order** (tooling on) and **repeat** (tooling off) side by side. Spread tooling over the order quantity.
- **Add-ons:** zipper / spout ₹ per piece × quantity.
- **Packing %** and **profit %** as in the Excel (percent of the running subtotal). Apply in a documented order: film+conversion+tooling+hardware, then packing, then optional process waste already in kg, then profit, then GST.
- **GST:** default **18%**, shown **separately** (not baked into the ex-GST cost). Typical HSN 3920 / 3921 / 3923 per FundRaksha compilation of Notification 9/2025-CT(R), as of 21 Oct 2026. Foil- or paper-heavy packs may differ — tell the owner to confirm with their CA. This is not tax advice.

### 5.5 Excel-compatible path (for tests and an optional Advanced toggle)

Documented in `02-reference-excel-analysis.md`. In this mode **only**:

```
GSM            = excel_density × microns     // PET 1.41, POLY 0.923, BOPP 0.91, BOPA 1.15, foil 2.71
QTY_RMC_first  = 1
QTY_RMC_film   = GSM_film / GSM_first
RATE_film      = ₹_per_kg × QTY_RMC
RATE_ink_adh   = GSM × ₹_per_kg              // Excel shortcut; not the product default
Cost_per_kg    = (Σ RATE + waste_on_RATE) / Σ QTY_RMC
area           = W × H × 2 / 1_000_000       // 3SS only
pouches_per_kg = (1000 / Σ GSM) / area
cost_pouch     = Cost_per_kg / pouches_per_kg
```

then + pouching ₹, packing %, optional second wastage (Job 1 only), profit %. Use **that block’s** wastage formula (`× G` vs `× G/100`). Do not “correct” the Excel.

---

## 6. Owner-editable rates

- One rate book: ₹/kg per film, adhesive, ink; conversion lines; cylinder/plate ₹/cm²; zipper; packing %; profit %; GST %; waste %; trim mm.
- **Sourced** defaults (Kanodia cylinder, library densities, adhesive dry GSM ranges) may be pre-filled and must name their source and date.
- **Every money number that is not sourced** (film ₹/kg, conversion ₹/kg, zipper ₹, margin) must show an **Example** or “starting default — change me” tag until the owner saves their own.
- Never present Example rupees as market prices. Never invent a conversion schedule.

---

## 7. Validation / unit tests (non-negotiable)

Add a test runner without breaking Next 16 (for example `vitest` or `node:test` + `tsx` in `web/`). Tests live next to the lib, e.g. `web/src/lib/flexpack/*.test.ts`.

**A. Excel path must reproduce** (exact floats in `02-reference-excel-analysis.md`, plus the rounded figures below):

- **Job 1 (primary):** PET 12 / POLY 40, 250 × 70 mm, rates and waste as in the sheet → **₹241.84/kg**, **494 pouches/kg**, **₹0.6867/pouch** (rounded). Exact: cost/kg `241.8365527488856`, pouches/kg `493.9735230191661`, final `0.6866617672639524`.
- Jobs 2–6 at the exact floats in `02-reference-excel-analysis.md` (Himalaya, Turbo Chrome / matt BOPP, Alu foil, MD Foods, Super Regulator).

If a test fails, **fix the code**, do not change the golden number without asking Satyam and showing the sheet cell.

**B. Product path must reproduce the researched stand-up example** in `01-research.md`:

- Stand-up 160 × 240 + 80 mm (G unfolded), zipper, 50,000 pcs, PET 12 / MET PET 12 / LDPE 70, densities and coat weights as written, 10 mm trim/side, 5% combined process waste (simple mode), **Example** rates as written, 6 gravure colours at Kanodia ₹2.10, circumference 640 mm, face 600 mm assumed.
- Laminate **105.44 GSM**. First-order factory cost **₹2,13,528** → **₹4.27/pouch**. Repeat (no cylinders) **₹1,65,144** → **₹3.30/pouch**. Cylinder share **₹0.97/pouch**. Selling-price and GST lines as in the research (Example 15% margin): invoice about ₹5.79 / ₹4.48. Recompute from the written steps; if you disagree by more than rounding, **stop and ask**.

**C. Formula guards:** stand-up G is unfolded; 3SS area is **two** panels; paper is not density-based; wet adhesive is not added into GSM; first vs repeat differs by tooling.

---

## 8. UI / UX

- **Mobile-first**, matches the existing site: Tailwind CSS 4, light theme first, existing `dark:` / `ThemeContext`, Lucide icons, Indian numeral style with **₹**.
- **Hinglish-friendly labels** (English with familiar trade words: standy, GSM, slit, POLY, pouches/kg). Short helper text (“if your gusset is 40+40 folded, type 80”).
- **Simple vs Advanced:** Simple = presets, combined waste, outer sizes, on-screen cost. Advanced = stage-wise waste, setup metres, fin/lap, measured GSM, Excel-compatible toggle, cylinder circumference check, slab rates.
- Live breakdown: material, conversion, tooling, hardware, waste, packing, profit; GST separate. A simple breakdown **chart** (bars or stacked) for the pouch cost.
- Pouch-type picker with a small diagram. Structure builder with layer add/remove and Indian presets.
- Do not dump all tools into `calculators/page.tsx`. Prefer **`/calculators/flexible`** and sub-routes (`/calculators/flexible/structure`, `/cost`, `/cylinder`, `/ink`). Deep-linkable. Link from `/tools` and `/calculators`.
- Accessibility: labelled inputs, keyboard usable, readable contrast on the light theme.
- No dark-pattern checkout. No pre-ticked paid add-ons. No “guaranteed” barrier or tax claims.

---

## 9. Tech constraints (match this repo)

- Website only: **`web/`**, **Next.js 16.3.1**, **React 19**, **TypeScript**, **Tailwind 4**. App Router. Client components (`"use client"`) for interactive tools, same as the current calculators page.
- Put formulas in `web/src/lib/flexpack/` so the homepage or a later PDF can import them (as `labelRate.ts` is shared today).
- Do not introduce a new CSS framework. Do not touch `tools/artwork-verification/` or `finance/`.
- No new backend required for MVP. `localStorage` for the rate book is enough. If you add a lead endpoint, ask Satyam first.
- Follow `AGENTS.md`: never invent a product claim; if a module is not shipped, do not present it as live.
- Keep `web` building and linting (`npm run build` / `npm run lint` in `web/`).

---

## 10. Deliverables and acceptance

1. Working MVP tools 1–4 on `/calculators/flexible`, registered in `web/content/tools.ts`, existing five tabs still correct.
2. `web/src/lib/flexpack/` with unit tests: Excel Jobs 1–6 and the stand-up worked example, all green.
3. Rate book with labelled Example defaults; sourced Kanodia cylinder defaults dated 12 Nov 2026.
4. First-order vs repeat visible on pouch cost and cylinder tools. GST 18% separate.
5. `docs/flexible-packaging-calculators/04-verification-notes.md` with your own sources and any disagreements.
6. A short PR description: what was built, what was not (Phase 2/3, stretch status), tests run, questions for Satyam.
7. **Branch + PR, not merged.** Suggested branch: `feat/flex-pack-calculators-mvp`. Base: `main` (or this docs branch if Satyam prefers).

Acceptance fails if: golden tests are skipped or golden numbers are edited to make tests pass; Example rates are shown as market rates; 3SS area uses a single panel; stand-up uses folded G as if it were full G; conversion ₹/kg is invented; existing label calculators break; Phase 2/3 is built instead of MVP tests.

---

## 11. Hard rules

1. **If any doubt or missing data, STOP and ask Satyam** before assuming.
2. **Never invent rates** or a conversion ₹/kg schedule.
3. Do your own research; cite it; do not silently contradict the golden tests.
4. Docs only were provided in this folder — you write the app code on a **separate branch** and **open a PR**. Do not merge. Do not commit secrets.
5. Nothing is posted or deployed to production without Satyam’s OK.
