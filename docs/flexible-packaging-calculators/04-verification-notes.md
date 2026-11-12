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

The build session ran in a sandbox whose network policy blocks most outside hosts. Every direct fetch of the source pages failed at DNS (`ENOTFOUND`). On Satyam's instruction (12 Nov 2026) the research doc's figures are kept as they are, and each figure the implementer could not re-open is marked below. **No number is to be changed without asking Satyam.**

| Figure used in the product | Value | Source named in `01-research.md` | Status |
| --- | --- | --- | --- |
| Gravure cylinder rate | ₹2.10/cm² below 750 mm circumference, ₹2.30/cm² above | Kanodia Gravure cylinder-costs page | **Unverified — from research doc.** Confirmed by Satyam as taken from that page on 12 Nov 2026; shown as "Source: Kanodia Gravure, retrieved 12 Nov 2026". |
| Flexo plate rate (Example) | ₹1.50/cm² | Alliance Printech flexo-vs-gravure tool default | Unverified — from research doc |
| BOPP density | 0.905 (range 0.90–0.91) | RollSpec materials; Balaji International | Unverified — from research doc |
| Matte BOPP warning | 0.84 g/cc | Cosmo PCT-2(M) TDS | Unverified — from research doc |
| CPP density | 0.90 (0.89–0.91) | RollSpec materials | Unverified — from research doc |
| LDPE density | 0.922 (0.915–0.928) | RollSpec materials | Unverified — from research doc |
| LLDPE density | 0.92 (0.915–0.930) | Balaji International | Unverified — from research doc |
| HDPE density | 0.955 (0.945–0.965) | RollSpec materials | Unverified — from research doc |
| Alu foil density | 2.70 (2.69–2.71) | RollSpec materials | Unverified — from research doc |
| BOPA density | 1.15 (1.14–1.16) | Jindal FILMON BXB TDS, Jan 2023 | Unverified — from research doc |
| EVOH density | 1.14 (1.12–1.19) | Kuraray EVAL E105B TDS; CloudFilm | Unverified — from research doc |
| Metal add-on on MET films | 0.5–1.0 GSM, default 0.80 | CloudFilm density guide | Unverified — from research doc |
| Solvent-based adhesive, dry | 2.0–2.8 GSM/bond (3.0–3.5 on paper) | Cytech HILAM GP-50 guide | Unverified — from research doc |
| Adhesive default | 2.5 GSM dry per bond | GSMCalculator 2-ply / 3-ply tools | Unverified — from research doc |
| Solventless adhesive, dry | 1.2–2.8 GSM/bond | Toplusse process guide | Unverified — from research doc |
| Ink laydown bands and coverage bands | gravure 1.0–2.5, flexo 0.8–1.5 GSM; coverage 20–100% | GSMCalculator ink tool | Unverified — from research doc |
| Average dry ink default | 1.5 GSM | RollSpec laminate-GSM guide | Unverified — from research doc |
| Stand-up area formula | A = W × (2H + G), G unfolded; 150 × 220 + 70 → 0.0765 m² | RollSpec pouch-weight guide | Unverified — from research doc (arithmetic re-checked) |
| Side-gusset planning formula | A ≈ H × (2W + 2G) | RollSpec perimeter note | Unverified — from research doc |
| Center-seal web formula | web = 2 × face + back seal + edge trim | PackagingCalculator.org | Unverified — from research doc |
| Lanes / master width | 2 × 570 + 2 × 10 = 1,160 mm | RollSpec order-quantity guide | Unverified — from research doc |
| Edge trim example | 10 mm per side | RollSpec order-quantity guide | Unverified — from research doc |
| Combined process waste | 3–5% typical | GSMCalculator pouch-costing FAQ | Unverified — from research doc |
| Stage waste starting ranges | print 2–4%, lam 1–3%, slit 1–2% | GSMCalculator FAQ | Unverified — from research doc |
| Stage waste example inputs | print 3% + 800 m, lam 2% + 400 m, slit 1% + 100 m, pouch 4% | RollSpec order-quantity guide | Unverified — from research doc |
| Seal widths | 5–10 mm typical, retort 8–10 mm | Aprint; RollSpec | Unverified — from research doc (shown as guidance only) |
| Structure presets and their microns | 11 presets | Cosmo, GT Pack, Wahren, Floeter, Kanodia Technoplast, GSMCalculator | Unverified — from research doc |
| GST schedule serial numbers | S. No. 121 / 122 / 124, "as of 21 Oct 2026" | FundRaksha compilation | Unverified — from research doc (the 18% rate itself was confirmed, §1) |

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

**Invoice price — the research table has a rounding slip (corrected).** The research writes "× 1.18 = ₹5.7951" and then quotes **₹5.79**. Half-up, 5.7951 is **₹5.80**. The table's ₹5.79 is ₹4.91 + ₹0.88, two already-rounded lines added together. Satyam's decision, 12 Nov 2026: show **₹5.80**. The engine now carries every per-pouch line at full precision and rounds only for display (2 decimals, half-up), and the golden test expects ₹5.80. The repeat-order invoice stays ₹4.48 (4.4819).

A side effect to know about: because each line is rounded on its own, a displayed selling price plus the displayed GST can differ from the displayed invoice price by one paisa (₹4.91 + ₹0.88 vs ₹5.80). The invoice price is the correct one.

Other display values were checked for the same slip:

| Value | Full precision | Research | Displayed |
| --- | ---: | ---: | ---: |
| First-order cost / pouch | 4.27051 | 4.27 | ₹4.27 |
| Repeat cost / pouch | 3.30283 | 3.30 | ₹3.30 |
| Cost per 1,000 (first / repeat) | 4270.51 / 3302.83 | 4,271 / 3,303 | ₹4,271 / ₹3,303 |
| Selling price (first / repeat) | 4.91109 / 3.79826 | 4.91 / 3.80 | ₹4.91 / ₹3.80 |
| GST (first / repeat) | 0.88400 / 0.68369 | 0.88 / 0.68 | ₹0.88 / ₹0.68 |
| **Invoice price, first order** | **5.79508** | **5.79** | **₹5.80** |
| Invoice price, repeat | 4.48194 | 4.48 | ₹4.48 |
| Cylinder share / pouch | 0.96768 | 0.97 | ₹0.97 |

Only the first-order invoice price was affected. The research's "489.24 ÷ 0.95 = 514.99, rounded to 515.00" is a mid-way rounding the engine does not do (it shows 515.0 kg from 514.991).

## 4. Conventions the build had to choose

Each is written in the code and visible in the UI. None is a rate.

1. **3-side seal web direction.** Default is the reference Excel's convention: slit = 2 × W + trim, repeat = H. Advanced mode has an **Orientation** toggle ("Width across web" / "Height across web"); the second gives slit = 2 × H, repeat = W. The pouch area is the same either way. Confirmed by Satyam, 12 Nov 2026.
2. **Fin vs lap back seal.** The input is the **total** web consumed by the back seal. The fin / lap switch pre-fills it (fin = 2 × seal width, lap = 1 × overlap, with a 10 mm seal) and is tagged "Starting default — change me (geometry-based, not sourced)". Confirmed by Satyam, 12 Nov 2026.
3. **Lanes.** Master web = lanes × web per lane + 2 × edge trim (RollSpec's "two 570 mm lanes plus 10 mm each side = 1,160 mm"). Trim is per master web, not per lane.
4. **Kanodia at exactly 750 mm.** The source says "below" and "above"; exactly 750 mm is treated as the lower tier.
5. **Conversion ₹/kg base.** Charged on input kg (film including trim and process waste), as in the worked example (515.00 × ₹76). ₹/1,000 is charged on the order quantity.
6. **Zipper / spout quantity.** Order quantity × ₹/piece, as in the worked example. Hardware lost on rejected pouches is not added.
7. **Setup metres → kg.** Setup metres × master web width × laminate GSM. One combined web, as the research allows for version 1 (it does not yet split the printed web from the sealant web).
8. **Metal add-on.** 0.80 GSM default for MET films (mid-point of 0.5–1.0), labelled as an assumption. A measured GSM replaces film + metal together.
9. **Adhesive and ink solids %.** 30% is a pre-filled starting value in the Ink & Adhesive tool, labelled "read it off your TDS". It is not sourced. It only affects wet kg, never laminate GSM.
10. **Film rates with no Example.** Only PET, MET PET and LDPE have an Example ₹/kg (from the worked example). Every other film starts blank. No film price was invented.
11. **Stage-wise waste defaults.** Print 3% + 800 m, lam 2% + 400 m, slit 1% + 100 m, pouch 4% — RollSpec's worked-example inputs as quoted in the research, tagged Example and described as illustrative.
12. **Excel-style comparison in Advanced mode.** Shown only for 3-side seal with films the workbook knows. It uses the workbook's densities and its ink / adhesive shortcut with the owner's current rates, so with dry ₹/kg rates it reads far higher than the product path. The card carries Satyam's note that the old sheet's ink and adhesive lines also included printing / lamination conversion. It is a comparison, never the default.
13. **Quote PDF and lead form.** Not built. Satyam will decide where leads go. The Pouch Cost page has a disabled "Prepare quote PDF — coming" placeholder only: no form, no endpoint, no data collected.

## 5. Tests

`npm test` in `web/` (Node's built-in runner through `tsx`; `vitest` was not used because its peer range conflicts with the repo's `@types/node@^20`). 39 tests: 8 Excel-path, 12 product-path, 19 formula guards.
