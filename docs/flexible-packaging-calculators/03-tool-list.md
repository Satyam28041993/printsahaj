# Tool list for printsahaj.com — 14 tools

Research date: 12 Nov 2026 (Asia/Calcutta). Planning only. Market URLs below returned **HTTP 200** on that date unless a note says otherwise.

Jindal, Cosmo, UFlex and SRF have **no public calculator** (TDS yield tables only). ePac is a quote form. PCI’s site did not load. No public MOQ or seal-strength *test* tool was found (only unit converters). Cerm, Kiwiplan and PCMC have no public calc.

Satyam’s Indian printer Excel (see [`02-reference-excel-analysis.md`](02-reference-excel-analysis.md)) already covers GSM, QTY RMC, ink/adhesive, wastage, 3SS slit = 2W, pouches/kg, pouching, packing % and profit %. The site must also add conversion, cylinder, GST, standy and zipper.

---

## (A) Tools in the market — one live example each

| Kind | Example (verified live 12 Nov 2026) |
| --- | --- |
| Laminate GSM / structure / yield | [GSMCalculator Packtools](https://gsmcalculator.com/packtools/) — 2/3/4-ply GSM and cost/m². Also Nalyquo, [RollSpec tools](https://rollspec.com/tools/). |
| Pouch cost / quote | [Agarwal, Chennai](https://www.agarwalpackagingsystem.in/calculators/blank) — pillow/3SS, margin. [Alliance Printech](https://allianceprintech.com/resources/pouch-cost-calculator/) — machine-time costing. [Wiserobe](https://shop.wiserobe.com/30dpc/flexpackkit/) — paid Excel, fullest Indian workbook. |
| Cylinder cost | [Kanodia Gravure](https://kanodiagravure.com/cylinder-costs/) — ₹2.10 / ₹2.30 per cm² (retrieved 12 Nov 2026). |
| Ink and adhesive | GSMCalculator ink (same hub); [RollSpec adhesive](https://rollspec.com/guides/adhesive-consumption/) — dry vs wet, solids %. |
| Pouch weight / pcs per kg | [RollSpec pouch weight](https://rollspec.com/guides/pouch-weight/) — correct stand-up formula. |
| Roll length, weight, OD, core | [Glenroy](https://www.glenroy.com/tools/conversions/); also PennPac, [Lintyco](https://tool.lintyco.com/film-roll/), PackagingCalculator.org. |
| Web / slit width | [PackagingCalculator.org](https://packagingcalculator.org/calculators/packaging-film-web-width/) |
| Pouch size / format | [Microflex](https://microflexfilm.com/calculators) (15 tools, barrier selector); [Aprint sizing](https://aprint.mx/en/technical-center/sizing-guide/) |
| OTR/WVTR estimate | [Innoform](https://www.innoform.de/en/permeation-calculator/) — literature estimate, **not** a lab test. |
| Unit converters (micron/mil, yield, seal and OTR units) | [PennPac](https://www.pennpac.com/resources/calculators/) |
| Flexo vs gravure break-even | [Alliance](https://allianceprintech.com/resources/flexo-vs-gravure/) |
| Recyclability (not a full LCA) | [RecyClass](https://tool.recyclass.eu/en/plastics/tool/); [CEFLEX D4ACE](https://guidelines.ceflex.eu/design-check/) |
| Simple BOPP GSM/yield (overseas) | [szfilmfactory](https://szfilmfactory.com/bopp-film-calculators/) |

---

## (B) Recommended 14 tools for printsahaj.com

**MVP = tools 1–4.** Quote PDF + lead form is a **stretch** on top of tool 2, not a fifteenth product. Phase 2 and 3 are listed so Claude can design for them, **not** build them in the first PR.

### MVP

1. **Structure / GSM / Yield** — converter and buyer.  
   **In:** layers (picker + Indian presets), microns, density or measured GSM, dry ink and adhesive (bonds auto-appear).  
   **Out:** total GSM, m²/kg, ₹/m², ₹/kg at owner film rates.  
   **Lead:** medium-high (rate-book login later). **Priority: MVP.**

2. **Pouch Cost** — converter.  
   **In:** type (3SS, pillow, standy), size, quantity, owner rates, waste, zipper/spout; keep Excel-style QTY RMC, packing % and profit % as an optional path.  
   **Out:** film kg, pouches/kg, cost per pouch and per 1,000, **first order vs repeat**.  
   **Lead:** highest. Fills the Excel gaps: conversion, cylinder, GST, standy, zipper. **Priority: MVP.**

3. **Cylinder / plate spread** — converter.  
   **In:** face length, circumference, colours (Kanodia ₹2.10 / ₹2.30 defaults, labelled; Alliance flexo plate ₹1.50 example).  
   **Out:** tooling ₹, ₹/pouch first vs repeat.  
   **Lead:** high on short runs. **Priority: MVP.**

4. **Ink and adhesive consumption** — converter.  
   **In:** print area, coverage %, dry GSM, solids %.  
   **Out:** kg and cost, wet vs dry. Physically correct mass (`area × GSM/1000 × ₹/kg`), not the Excel shortcut, unless Excel-mode is explicitly on.  
   **Lead:** medium. **Priority: MVP.**

**Stretch (with MVP, not Phase 2):** **Quote PDF + GST + quantity slabs**, behind a lead form (name, WhatsApp, company, city). Ask Satyam where leads should land before wiring a backend. GST 18% shown separately.

### Phase 2 — list only, do not build in the first PR

5. **Roll length / weight / OD / core** — converter (stores, dispatch). In: OD, core, thickness, width, GSM. Out: metres, kg, optional bags/roll. Lead: medium, daily sticky.
6. **Web / slit / layflat** — converter. In: pouch type, seals, trim, lanes. Out: slit, master width, cylinder-repeat warning. Lead: medium.
7. **Quote PDF + GST + slabs** — if not already delivered as the MVP stretch. Lead: highest.
8. **Pouch size / volume** — buyer. In: fill weight, bulk density, format. Out: suggested W×H+G. Lead: high for brands.
9. **Unit converters** — both. Micron/mil, yield, OTR/WVTR units. Lead: low, strong SEO.
10. **Flexo vs gravure break-even** — converter. Lead: medium.
11. **Label / rollstock cost** — already partly live at `/calculators/?tab=label-rate` (`web/src/lib/labelRate.ts`). Extend later; do not regress it. Lead: medium.

### Phase 3 — list only

12. **Barrier starting-point selector** — buyer. Product threats → a suggested Indian structure, **not** a certified OTR. Lead: medium.
13. **Recyclability helper** — buyer. Guided questions plus RecyClass/CEFLEX links; **do not invent an LCA**. Lead: medium.
14. **MOQ helper** — converter. From cylinder + setup waste vs quantity, not a published MOQ table. Lead: high in sales talks.

**Skip on the free site / leave for Flexora:** a “seal strength calculator” (that is a lab test; a unit converter is enough); job cards, CRM, stock, production tracking.

---

## How this maps to the existing website

Live calculators today (paper/label, not flexible laminate) live at [`web/src/app/(pages)/calculators/page.tsx`](../../web/src/app/(pages)/calculators/page.tsx), with tabs in [`web/content/tools.ts`](../../web/content/tools.ts): `label-rate`, `gsm-weight`, `sheet-ups`, `gear-repeat`, `corrugated-bf`. Shared math is in [`web/src/lib/labelRate.ts`](../../web/src/lib/labelRate.ts).

**Recommendation:** add a new hub at `/calculators/flexible` (and sub-routes per tool), extract math to `web/src/lib/flexpack/`, and register the new tools in `web/content/tools.ts`. Do not cram these into the already long existing page, and do not break the five live tabs.
