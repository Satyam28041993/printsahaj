# Indian printer costing Excel — decoded

**Source file:** [`reference/printer-costing-sample.xls`](reference/printer-costing-sample.xls) (OLE `.xls`, 54,784 bytes). This is a real Indian converter workbook Satyam shared. It is **not** a PrintSahaj product and its rupee rates are **that plant’s historical rates**, not defaults to ship.

**CSV dumps** (for inspection without Excel):

| Sheet | Values | Formulas |
| --- | --- | --- |
| COSTING (3 jobs) | [`COSTING_values.csv`](reference/COSTING_values.csv) | [`COSTING_formulas.csv`](reference/COSTING_formulas.csv) |
| ALFOIL COSTING | [`ALFOIL_COSTING_values.csv`](reference/ALFOIL_COSTING_values.csv) | [`ALFOIL_COSTING_formulas.csv`](reference/ALFOIL_COSTING_formulas.csv) |
| Sheet3 (MD Foods) | [`Sheet3_values.csv`](reference/Sheet3_values.csv) | [`Sheet3_formulas.csv`](reference/Sheet3_formulas.csv) |
| ankur (Super Regulator) | [`ankur_values.csv`](reference/ankur_values.csv) | [`ankur_formulas.csv`](reference/ankur_formulas.csv) |

The workbook has **four sheets and six worked jobs**. Formulas were read from a LibreOffice conversion of the same file on 12 Nov 2026. The primary golden test is Job 1 below.

---

## Hard-coded densities in the formulas

These are baked into the GSM formulas (for example `E4 = 1.41*D4`). They are this plant’s convention, not a TDS.

| Material | Excel density | GSM formula | Versus our research library |
| --- | --- | --- | --- |
| PET / MET PET | **1.41** | `1.41 * microns` | Cosmo CF-B0-CPF uses **1.40** (12 µm = 16.80 GSM). Excel 12 µm = **16.92 GSM**. |
| POLY (PE) | **0.923** | `0.923 * microns` | RollSpec LDPE nominal **0.922**. Close. |
| BOPP | **0.91** | `0.91 * microns` | Research planning default **0.905**; 0.91 is inside the 0.90–0.91 band. |
| BOPA | **1.15** | `1.15 * microns` | Matches Jindal FILMON BXB. |
| AL.FOIL | **2.71** | `2.71 * microns` | Research **2.70** (range 2.69–2.71). Excel 9 µm = **24.39 GSM**; 9 × 2.70 = 24.30. |

**For Excel golden tests, use the Excel densities (1.41, 0.923, 0.91, 1.15, 2.71).** For the live PrintSahaj calculator, use the researched library defaults (PET 1.40, and so on), owner-editable, and prefer measured GSM. Do not silently mix the two.

MET PET uses the same 1.41 as PET. There is **no metal-deposit add-on** in this workbook.

---

## Step-by-step logic (every job follows this)

Notation: first film layer is the reference (usually PET or BOPP). Area is implicit: 1 kg of the first layer covers `1000 / GSM_first` square metres.

### 1. Per-layer GSM

```
GSM = density × microns
```

Ink and adhesive GSM are **typed in**, not computed (typically 2.0 per line; 4 or 6 on multi-bond jobs).

### 2. QTY RMC (quantity of raw material, as a ratio to the first layer)

```
QTY_RMC_first = 1
QTY_RMC_other_film = GSM_other / GSM_first
```

This is the kilograms of that film needed for the same area as **1 kg of the first layer**. Ink and adhesive have QTY RMC = 0 (or blank), so they **do not** enter the kilogram denominator.

### 3. RATE column (rupees for that 1 kg-of-first-layer batch)

```
Films:     RATE = Rate_per_kg × QTY_RMC
Ink/adhesive: RATE = GSM × Rate_per_kg     ← shortcut, see warning below
```

### 4. Laminate ₹/kg

```
Sum_GSM      = Σ GSM (films + ink + adhesive)
Sum_QTY      = Σ QTY_RMC (films only, because ink/adhesive QTY is 0)
Sum_RATE     = Σ RATE
Waste_RATE   = Sum_RATE × wastage          ← see % convention below
Total_RATE   = Sum_RATE + Waste_RATE
Cost_per_kg  = Total_RATE / Sum_QTY
Yield_m2_kg  = 1000 / Sum_GSM
```

**Wastage % convention is inconsistent inside the file.** Some blocks store `0.1` and use `H = H_sum * G`. Others store `10` and use `H = H_sum * G / 100`. Both mean 10%. Golden tests must use **the formula in that block**, not a guessed normalisation. The shipped calculator should have a single clear control: wastage as a percent (e.g. 10), always divided by 100.

**Ink/adhesive warning:** `RATE = GSM × ₹/kg` is **not dimensionally the same** as film costing (kg × ₹/kg). The physically correct cost is `area_m² × (dry_GSM / 1000) × ₹/kg`. For the same area as 1 kg of 16.92-GSM PET, 2 GSM of ink is only `2/16.92 ≈ 0.118` kg, so the Excel shortcut **overstates** ink and adhesive relative to a mass balance. **Excel golden tests must implement the Excel shortcut.** The live product should use the physically correct method as the default, and may offer an optional “Excel-compatible” path for comparison. If that product decision is unclear, **stop and ask Satyam** — do not guess.

### 5. Pouch geometry (this workbook is 3-side seal only)

```
Slit width (mm)     = entered by hand; in every job it equals 2 × pouch width
Pouch area (m²)     = W_mm × H_mm × 2 / 1,000,000     ("YEILD PER KG")
Pouches_per_kg      = Yield_m2_kg / pouch_area
Cost_of_pouch       = Cost_per_kg / Pouches_per_kg
```

There is **no stand-up gusset, no trim in the area, no zipper amount filled in** (the zipper row exists but is empty). Slit width is not a formula.

### 6. After the film cost

```
Subtotal     = Cost_of_pouch + pouching_₹ + zipper_₹     (zipper empty in all jobs)
Packing      = Subtotal × packing_%
After_pack   = Subtotal + Packing
[Optional second wastage: only Job 1 does After_pack × 5%]
Profit       = (running total) × profit_%
Final        = running total + Profit
```

**No conversion ₹/kg (print / lam / slit as separate lines), no cylinder/plate, no GST.** Those are the gaps PrintSahaj must fill. Pouching is a flat ₹ per pouch.

---

## The six worked jobs — golden numbers

Rounded display values are what a user would quote. **Unit tests should compare with a tight tolerance on the exact floats** (for example 1e-9 relative, or 4 decimal paise where the prompt gives a rounded figure).

### Job 1 — COSTING block 1 (primary golden test)

**PET 12 / POLY 40, 3SS 250 × 70 mm.**

| Input | Value |
| --- | --- |
| PET | 12 µm, density 1.41, ₹130/kg, QTY RMC = 1 |
| POLY | 40 µm, density 0.923, ₹135/kg |
| Ink | 2 GSM × ₹75 |
| Adhesive | 2 GSM × ₹62.5 |
| Laminate wastage | **0.1** (decimal), formula `H12 = H11*G12` |
| Slit | 500 mm (= 2 × 250) |
| Pouching | ₹0.05/pouch |
| Packing | 1% (`D33 = 0.01`) |
| Second wastage | **5%** after packing (this job only) |
| Profit | 20% |

| Output | Exact (from the sheet) | Rounded target |
| --- | ---: | ---: |
| Total GSM | 57.84 | 57.84 |
| Sum QTY RMC | 3.1820330969267143 | 3.1820 |
| Cost of laminate ₹/kg | **241.8365527488856** | **₹241.84/kg** |
| m²/kg | 17.289073305670815 | 17.2891 |
| Pouch area m² | 0.035 | 0.035 |
| Pouches/kg | **493.9735230191661** | **494 pouches/kg** |
| Film cost/pouch | 0.48957391738484407 | ₹0.4896 |
| After pouching | 0.5395739173848441 | |
| After packing | 0.5449696565586925 | |
| After 5% waste | 0.572218139386627 | |
| **Final ₹/pouch** | **0.6866617672639524** | **₹0.6867/pouch** |

Arithmetic check: `769.5319148936171 / 3.1820330969267143 = 241.83655…`; `17.289073305670815 / 0.035 = 493.97352…`; `241.83655… / 493.97352… = 0.4895739…`; then +0.05, ×1.01, ×1.05, ×1.20 → **0.686661767**.

### Job 2 — COSTING block 2, “himalaya facial wipes”

PET 12 / POLY 55, 150 × 90 mm. PET ₹130, MET PET rate present but micron 0, POLY ₹120, ink 2×₹90, adhesive 2×₹62.5. Wastage **10** with formula `H54 = H53*G54/100`. Packing 2%, profit 20%. **No second wastage.** Pouching ₹0.04. Slit 300.

| Output | Exact | Rounded |
| --- | ---: | ---: |
| Total GSM | 71.685 | 71.685 |
| Cost ₹/kg | 218.618600871685 | ₹218.62 |
| Pouches/kg | 516.6636958504156 | 516.66 |
| Final ₹/pouch | 0.5668774956864296 | ₹0.5669 |

### Job 3 — COSTING block 3, “MATT BOPP COSTING” / TURBO CHROME 8M (job no. 511031)

BOPP 20 (density 0.91, ₹135) / POLY 30 (₹145), ink 2×₹62.5, adhesive 2×₹62.5. Wastage **7** with `/100`. Packing 2%, profit **10%**. No second wastage. Pouch 145 × 150, slit 290. Pouching ₹0.06.

| Output | Exact | Rounded |
| --- | ---: | ---: |
| Total GSM | 49.89 | 49.89 |
| Cost ₹/kg | 256.99702549575073 | ₹257.00 |
| Pouches/kg | 460.783839389185 | 460.78 |
| Final ₹/pouch | 0.6931029332479846 | ₹0.6931 |

### Job 4 — sheet ALFOIL COSTING

PET 12 / Alu 9 / PET 12 / POLY 40. Rates: PET ₹120, foil ₹450, POLY ₹130. Ink rate ₹75 but ink GSM blank → RATE 0. Adhesive **6 GSM** × ₹62.5 = ₹375 (three bonds). Wastage **15** with `/100`. Packing 2%, profit 15%. Pouch 50 × 75, slit 100. Pouching ₹0.05. Both PET layers have QTY RMC hard-coded as **1** (same micron as the first PET, so a ratio would also be 1).

| Output | Exact | Rounded |
| --- | ---: | ---: |
| Total GSM | 101.15 | 101.15 |
| Sum QTY RMC | 5.623522458628842 | 5.6235 |
| Cost ₹/kg | 316.4270625328429 | ₹316.43 |
| Pouches/kg | 1318.1743285549514 | 1318.17 |
| Final ₹/pouch | 0.34022804040829613 | ₹0.3402 |

### Job 5 — Sheet3, “m d foods costing plain pouches 16.08.17”

PET 12 + MET PET 12 + POLY 80 (12+12+80), PET ₹126, MET PET ₹142, POLY ₹126. Ink 0, adhesive **4 GSM** × ₹62.5. Wastage **10** with `/100`. Packing 2%, profit 10%. Pouch 280 × 380, 3-side seal, slit 560. Pouching ₹0.035.

A note on the sheet says “280 x 380 3 side seal = 3.90 each” and “305 x 445 == 5/-each”. Those look like **quoted or target selling prices**, not the formula output. The formula final is **₹4.9610**, which is **not** 3.90. Do not force the calculator to equal 3.90. If asked, flag the note and ask Satyam.

| Output | Exact | Rounded |
| --- | ---: | ---: |
| Total GSM | 111.68 | 111.68 |
| Cost ₹/kg | 184.5768945022288 | ₹184.58 |
| Pouches/kg | 42.07779477346662 | 42.08 |
| Film cost/pouch | 4.386562924600296 | ₹4.3866 |
| Final ₹/pouch | 4.960993601401532 | ₹4.9610 |

### Job 6 — sheet ankur, “SUPER REGULATOR” (job no. 111006)

PET 12 / POLY 40, PET ₹139, POLY ₹134, ink 2×₹62.5, adhesive 2×₹62.5. Wastage **0.1** (decimal, `H11 = H10*G11`, same as Job 1). Packing 1%, profit 20%. No second wastage. Pouch 235 × 245, slit 470. Pouching ₹0.06.

| Output | Exact | Rounded |
| --- | ---: | ---: |
| Total GSM | 57.84 | 57.84 |
| Cost ₹/kg | 235.55118870728083 | ₹235.55 |
| Pouches/kg | 150.1439279693514 | 150.14 |
| Final ₹/pouch | 1.9741491458493114 | ₹1.9741 |

---

## Gaps versus a full PrintSahaj quote (do not “fix” the Excel; extend the product)

| Present in the Excel | Missing — add on printsahaj.com |
| --- | --- |
| GSM = micron × density; QTY RMC ratio; ink & adhesive shortcut; one wastage % on material RATE; 3SS area = 2WH; pouches/kg; pouching ₹; packing %; profit % | **Conversion** lines (print, lamination, slitting, pouching as ₹/kg or machine time) |
| | **Cylinder / plate** cost, first order vs repeat |
| | **GST 18%**, shown separately (HSN typically 3923 for pouches) |
| | **Stand-up / side-gusset / rollstock** area formulas (Excel is 3SS only) |
| | **Zipper / spout** amounts (row exists, always empty) |
| | **Layout trim** (Excel slit is 2W with no extra trim); **setup metres**; stage-wise backward waste |
| | **Owner-saved rate book**; physically correct ink/adhesive mass |
| | MET metal add-on; paper as mill GSM; EVOH / nylon presets as a library |

Leftover cells (ignore in tests): `Y10 = "qqqqqqqqqq"`, `F46 = 165`, `L2`/`M2`.

---

## What a faithful Excel-mode function must do

1. Use Excel densities and Excel ink/adhesive RATE = GSM × rate.
2. Use that block’s wastage formula (`× G` vs `× G/100`).
3. Apply the optional second wastage only when the job has it (Job 1).
4. Reproduce Job 1 as **₹241.84/kg**, **494 pouches/kg**, **₹0.6867/pouch** (rounded), and the exact floats above.
5. Reproduce Jobs 2–6 at the exact floats in this note.

The **shipped** pouch-cost tool should then add conversion, cylinder, GST, standy, zipper, and the researched area/waste methods, with every money default labelled **Example**.
