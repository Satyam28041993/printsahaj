# Flexible packaging calculators — research & build brief

**Docs only.** This folder is the brief for building free flexible-packaging costing tools on [printsahaj.com](https://printsahaj.com), as a lead magnet toward Flexora. No application code belongs here.

Prepared 12 Nov 2026 (Asia/Calcutta) for Satyam Singh (PrintSahaj). Claude (or any implementer) should start at [`CLAUDE_PROMPT.md`](CLAUDE_PROMPT.md) and read the files below **before writing code**.

## Files

| File | What it is |
| --- | --- |
| [`CLAUDE_PROMPT.md`](CLAUDE_PROMPT.md) | Structured build prompt: role, scope (MVP tools 1–4), formulas, tests, UI, stack, acceptance, “stop and ask” rule. |
| [`01-research.md`](01-research.md) | Full research: densities, adhesive/ink GSM, Indian structure presets, pouch-area formulas, wastage, conversion, Kanodia cylinders, GST/HSN, worked stand-up example (160×240+80), competitor tools and the gap. |
| [`02-reference-excel-analysis.md`](02-reference-excel-analysis.md) | Satyam’s Indian printer Excel, decoded step by step, with all six jobs’ numbers and golden tests (including PET12/POLY40 250×70 → ₹241.84/kg, 494 pouches/kg, ₹0.6867/pouch). |
| [`03-tool-list.md`](03-tool-list.md) | Market tools with verified URLs, and the 14-tool MVP / Phase 2 / Phase 3 list. |
| [`reference/printer-costing-sample.xls`](reference/printer-costing-sample.xls) | Copy of the original `.xls`. |
| [`reference/*_values.csv`](reference/) and `*_formulas.csv` | Sheet-by-sheet dumps. |
| [`reference/research.pdf`](reference/research.pdf) | 24-page PDF of the research (same content as the Drive Doc). |

The same research is also in Satyam’s Drive folder [Printsahaj Business Operation](https://drive.google.com/drive/folders/1SxnQpQDsOnyW10KLC-0nPEgllgsmNRi1): [Google Doc](https://docs.google.com/document/d/1lSM9h5H0dtw9lzXvqs5nKVdUVk7GFquWHbbZcJyR-NM/edit?usp=drivesdk), [PDF](https://drive.google.com/file/d/1xqfOhtWJM3aeClCdx4Eogg0tocr6FRqJ/view?usp=drivesdk).

## Existing calculator stack in this repo (do not break it)

| Path | Role |
| --- | --- |
| `web/` | Marketing site: **Next.js 16.3.1**, **React 19**, **TypeScript**, **Tailwind CSS 4**, Framer Motion, GSAP, Lucide. Firebase hosting (`firebase.json`). |
| `web/src/app/(pages)/calculators/page.tsx` | Live hub. Tabs: label-rate, gsm-weight, sheet-ups, gear-repeat, corrugated-bf. Client component, `₹`, light/dark via existing theme. |
| `web/src/lib/labelRate.ts` | Shared roll-label formula (also used on the homepage). Pattern to copy for `web/src/lib/flexpack/`. |
| `web/content/tools.ts` | `CALCULATOR_TABS` and the `/tools` cards. Register new flexible tools here. |
| `web/src/context/ThemeContext.tsx` | Theme. Prefer the existing light theme and `dark:` classes. |
| `docs/` | Policies and planning. This brief lives at `docs/flexible-packaging-calculators/`. |
| `tools/artwork-verification/` | PrintVerify — **out of scope**. |
| `finance/` | Internal finance site — **out of scope**. |

**Suggested placement for the new work (in a later, code PR):** `/calculators/flexible` and sub-routes; math in `web/src/lib/flexpack/`; unit tests that reproduce the Excel and the stand-up worked example. Do not regress the five live calculators.

## Rules for implementers

- Docs and formulas first; then code on a **new branch**, opened as a **PR** (do not merge yourself).
- If anything is doubtful or data is missing, **stop and ask Satyam**. Never invent rates.
- Do your own research to verify and extend densities and formulas, and **cite sources** in docs. Prefer TDS and measured GSM over a single default.
- Money defaults that are not sourced must be labelled **Example**.
