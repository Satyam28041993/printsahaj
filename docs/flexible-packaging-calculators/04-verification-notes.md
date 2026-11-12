# Verification notes — MVP build

**Date:** 12 Nov 2026. Written by the implementer of the MVP (tools 1–4) while building `web/src/lib/flexpack/`.

This file says what was re-checked independently, what could **not** be re-checked, and where the build had to choose a convention. Nothing in the golden tests was changed.

---

## 1. What was re-checked, and how

| Item | Result | How |
| --- | --- | --- |
| Excel Jobs 1–6, every golden float in `02-reference-excel-analysis.md` | **Confirmed, exact** | Read the cached cell values straight out of `reference/printer-costing-sample.xls` with `xlrd` (cells H14, E24, E26, E41, E53, H56, E66, E80, E90, H93, E103, E117, F11, E11; ALFOIL D8, E8, G11, D21, D35; Sheet3 E7, H10, E20, E22, E34; ankur E10, H13, E23, E37). All match the note to the last digit. |
| Excel formulas (densities, `× G` vs `× G/100`, second wastage only in Job 1) | **Confirmed** | Read `reference/*_formulas.csv` line by line against the note. |
| Excel-mode engine vs the sheet | **Passes at 1e-12 relative** | `web/src/lib/flexpack/excelMode.test.ts`. |
| Stand-up worked example (`01-research.md` §8), recomputed from the written steps | **Confirmed within rounding** — see §3 | `web/src/lib/flexpack/pouchCost.test.ts`. |
| PET / BOPET density 1.40 g/cc, 12 µm = 16.8 GSM, 59.52 m²/kg | **Confirmed** | Web search returned Cosmo Films TDS rows (BLF(MO), MTF-1, CF-B1) with exactly these values. |
| GST 18% for plastic packing goods (HSN 3923), with a 5% entry for paper sacks / bio-degradable bags under Notification 9/2025-CT(R), effective 22 Sep 2025 | **Confirmed in outline** | Web search (Tally Solutions guide, Taxclue, TaxHeal / Studycafe AAR reports). One result says the notification has been amended since (19/2025-CT(R), 31 Dec 2025). The exact schedule serial numbers (121 / 122 / 124) were **not** re-read. |

## 2. What could NOT be re-checked

The build session ran in a sandbox whose network policy blocks most outside hosts. Every direct fetch of the pages below failed at DNS (`ENOTFOUND`), so their figures are carried over from `01-research.md` **unverified by the implementer**:

- `kanodiagravure.com/cylinder-costs/` — ₹2.10 / ₹2.30 per cm², 750 mm split. A web search did not surface the page either.
- `rollspec.com` (materials, pouch-weight, order-quantity, adhesive-consumption, laminate-gsm).
- `gsmcalculator.com/packtools/`, `allianceprintech.com`, `cytechgroup.in`, `cloudflexfilm.com`, `packagingcalculator.org`, `fundraksha.com`, `jindalnylonfilms.com`, and the two Cosmo PDF URLs (the PET figure was confirmed through search, the matte BOPP 0.84 was not).

**Action for Satyam:** open the Kanodia page once and confirm ₹2.10 / ₹2.30 and the 750 mm split are still shown, since that is the one sourced rupee figure in the product. Everything else on this list is a density or a starting range that the owner can overwrite.

No number from our docs was found to disagree with a primary source, so nothing needed a "document both" entry.

## 3. Worked example: where the research rounds

The research rounds mid-calculation; the engine does not.

| Line | Research | Engine (unrounded) |
| --- | ---: | ---: |
| Input kg | 515.00 | 514.991 |
| Material | ₹81,004 (515.00 × 157.29) | ₹81,002.19 |
| Conversion | ₹39,140 | ₹39,139.33 |
| First-order factory cost | ₹2,13,528 | ₹2,13,525.52 |
| Repeat factory cost | ₹1,65,144 | ₹1,65,141.52 |

The gap is ₹2.48 on ₹2.1 lakh — rounding only. Per pouch the two agree to the paisa: ₹4.27 / ₹3.30, cylinder share ₹0.97, selling ₹4.91 / ₹3.80. Tests allow ±₹3 on the order totals and require the per-pouch figures exactly.

**Invoice price convention.** The research writes "× 1.18 = ₹5.7951" and then quotes **₹5.79**. Rounded normally, 5.7951 is ₹5.80. The table's ₹5.79 is ₹4.91 + ₹0.88, i.e. the selling price is rounded to the paisa first and GST is worked on the rounded price. The engine follows the table (that is also how a quotation is typed): per-pouch selling price rounded → GST on that → sum. Order-level totals are not rounded mid-way. **Question for Satyam** if he would rather show ₹5.80.

## 4. Conventions the build had to choose

Each is written in the code and visible in the UI. None is a rate.

1. **3-side seal web direction.** Slit = 2 × W + trim, repeat = H — the same convention as the reference Excel (slit = 2 × pouch width). A machine that runs H across the web would give a slightly different trim share. The UI says so.
2. **Fin vs lap back seal.** The brief asks for an owner pick but gives no numbers. The input is the **total** web consumed by the back seal. The fin / lap switch only pre-fills it from geometry (fin = 2 × seal width, lap = 1 × overlap, with a 10 mm seal); the owner types over it. Not from a cited source.
3. **Lanes.** Master web = lanes × web per lane + 2 × edge trim (RollSpec's "two 570 mm lanes plus 10 mm each side = 1,160 mm"). Trim is per master web, not per lane.
4. **Kanodia at exactly 750 mm.** The source says "below" and "above"; exactly 750 mm is treated as the lower tier.
5. **Conversion ₹/kg base.** Charged on input kg (film including trim and process waste), as in the worked example (515.00 × ₹76). ₹/1,000 is charged on the order quantity.
6. **Zipper / spout quantity.** Order quantity × ₹/piece, as in the worked example. Hardware lost on rejected pouches is not added.
7. **Setup metres → kg.** Setup metres × master web width × laminate GSM. One combined web, as the research allows for version 1 (it does not yet split the printed web from the sealant web).
8. **Metal add-on.** 0.80 GSM default for MET films (mid-point of 0.5–1.0), labelled as an assumption. A measured GSM replaces film + metal together.
9. **Adhesive and ink solids %.** 30% is a pre-filled starting value in the Ink & Adhesive tool, labelled "read it off your TDS". It is not sourced. It only affects wet kg, never laminate GSM.
10. **Film rates with no Example.** Only PET, MET PET and LDPE have an Example ₹/kg (from the worked example). Every other film starts blank. No film price was invented.
11. **Stage-wise waste defaults.** Print 3% + 800 m, lam 2% + 400 m, slit 1% + 100 m, pouch 4% — RollSpec's worked-example inputs as quoted in the research, tagged Example and described as illustrative.
12. **Excel-style comparison in Advanced mode.** Shown only for 3-side seal with films the workbook knows. It uses the workbook's densities and its ink / adhesive shortcut with the owner's current rates, so with dry ₹/kg rates it reads far higher than the product path. The card says this. It is a comparison, never the default.

## 5. Tests

`npm test` in `web/` (Node's built-in runner through `tsx`; `vitest` was not used because its peer range conflicts with the repo's `@types/node@^20`). 37 tests: 8 Excel-path, 11 product-path, 18 formula guards.
