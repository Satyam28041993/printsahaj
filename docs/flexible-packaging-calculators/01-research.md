# Flexible Packaging Costing — Full Research

**Date:** 12 Nov 2026 (Asia/Calcutta). **Status:** research only; no app code in this folder.

This is the complete costing research prepared for PrintSahaj: densities, adhesive and ink dry GSM, Indian structure presets, pouch-area formulas, wastage, conversion, Kanodia cylinder rates, GST/HSN, the worked stand-up example (160 × 240 + 80 mm with zipper), competitor tools, and the product gap.

**Also stored on Satyam’s Google Drive** (Printsahaj Business Operation folder):

- [Google Doc](https://docs.google.com/document/d/1lSM9h5H0dtw9lzXvqs5nKVdUVk7GFquWHbbZcJyR-NM/edit?usp=drivesdk)
- [PDF copy (24 pages)](https://drive.google.com/file/d/1xqfOhtWJM3aeClCdx4Eogg0tocr6FRqJ/view?usp=drivesdk) — also at [`reference/research.pdf`](reference/research.pdf)
- [Drive folder](https://drive.google.com/drive/folders/1SxnQpQDsOnyW10KLC-0nPEgllgsmNRi1)
- Page: [Flexible Packaging Costing — Research & Calculator Plan](https://cursor.com/canvas/store-3e0d25cb-a088-4bf0-8e39-5a649b4a9b4c/12292f74-0c33-4f3d-9148-fa134050a673)

**Related in this folder:** [`02-reference-excel-analysis.md`](02-reference-excel-analysis.md) (Indian printer Excel, golden numbers), [`03-tool-list.md`](03-tool-list.md) (14-tool plan), [`CLAUDE_PROMPT.md`](CLAUDE_PROMPT.md) (build prompt).

**Label convention:** Sourced data (densities, microns, waste ranges, cylinder rates, GST) comes from named sources opened 12 Nov 2026 and was not invented. Example rupees in the worked example are labelled illustrations, not market prices — except the cylinder rate ₹2.10/cm² from Kanodia. Owners always enter their own film, conversion, zipper and margin rates.

---


**How PrintSahaj can cost 2-layer, 3-layer and 4-layer flexible-packaging jobs**, including foil, LD, MET, nylon and paper, for every common pouch type, with correct formulas and owner-entered rates.

Research completed **12 Nov 2026 (Asia/Calcutta)**. Densities, microns, waste ranges, cylinder rates and GST are sourced. Every rupee figure in the worked example is a labelled Example, not a market rate.

---

## Three labels used throughout this document

- **Sourced data:** densities, microns, GSM, waste ranges, cylinder rates and GST come from named sources opened on 12 Nov 2026. Nothing in those tables was invented.
- **Example rupees:** every Rs/kg, Rs/pouch and conversion charge in the worked example is a labelled illustration so the arithmetic can be checked.
- **Owner rates:** the calculator gives formulas, a film library and sensible density and coat-weight defaults. Film rates, conversion, wastage, zipper and margin always belong to the owner.

---

## 1. How we handle every structure and every pouch type

Flexible costing looks messy because there are many films and many pouch shapes. The clean way is to split the problem into **two independent inputs**.

1. **The structure** (2-layer, 3-layer, 4-layer, foil, LD, MET, nylon, paper). This only decides laminate GSM and material cost per square metre. The user builds the stack layer by layer: each film is micron times density, paper is entered as mill GSM, each adhesive bond is a dry GSM, and ink is a dry GSM. Two-layer has one bond, three-layer has two, four-layer has three. Foil or MET is just another library item, not a special calculator.

2. **The pouch type** (3-side seal, center seal, standy, side gusset, box pouch, rollstock). This only decides how much film area one pouch uses. A stand-up pouch uses two faces plus an unfolded bottom gusset. A center-seal pillow uses a tube width (two faces plus back seal). Zipper, spout and valve are not film layers — they are a rupee (and optional gram) add-on per piece.

So the same PET / MET PET / PE structure can cost a 3-side-seal sachet or a zipper standy. The same standy size can be run on a 2-layer or a 4-layer foil retort laminate. Rates stay in the owner's rate book. We do not need a separate tool for every combination — we need **one structure builder, one pouch-geometry picker, and one costing sheet**.

---

## 2. Material data — density, microns, ink and adhesive

**Core formula:** GSM = micron × density (g/cm³). Yield (m²/kg) = 1,000 ÷ GSM. For a laminate, add every layer and every retained dry coating. Prefer measured GSM from a weighed sample or the supplier TDS when it is available.

**Total GSM = Σ (micron × density) + Σ (dry adhesive GSM) + dry ink GSM + other dry coatings**

### Film densities and typical microns

| Film | Default density | Typical microns | Example GSM | Notes and source |
| --- | --- | --- | --- | --- |
| PET / BOPET | 1.40 g/cm³ (range 1.39–1.41) | 8, 10, 12, 15, 19, 23, 36, 50 (print layer often 12 or 23) | 12 µm × 1.40 = 16.80 GSM | Indian Cosmo CF-B0-CPF lists density 1.40 g/cc and these exact GSMs. Source: [Cosmo Films CF-B0-CPF TDS](https://www.cosmofilms.com/public/uploads/pdf/1708359434.pdf). |
| BOPP (plain, standard) | 0.905 g/cm³ (range 0.90–0.91) | 12, 15, 18, 20, 25, 30, 35, 40, 50 (snacks often 15–25) | 20 µm × 0.905 = 18.10 GSM | Planning default 0.905. Matte or cavitated BOPP can be much lighter — a Cosmo matte wet-lamination grade lists 0.84 g/cc. Always use the grade TDS or measured GSM. Sources: RollSpec materials; Balaji International 0.90–0.91; Cosmo PCT-2(M) matte 0.84. |
| MET BOPP / MET PET | Same as the base film (density unchanged) | MET PET often 12 or 23; MET BOPP often 15–20 | Base GSM + about 0.5–1.0 GSM aluminium deposit | Metallisation is a thin aluminium layer on the same PET or BOPP. Prefer measured GSM from the metalliser TDS. Source: CloudFilm density guide. |
| CPP (cast PP) | 0.90 g/cm³ (range 0.89–0.91) | 20–80 (retort sealant often 60–80) | 60 µm × 0.90 = 54.00 GSM | Used as a heat-seal layer, including retort (higher melt point than PE). Source: RollSpec materials. |
| LDPE | 0.922 g/cm³ (range 0.915–0.928) | 25–150 (pouch sealant often 40–100) | 70 µm × 0.922 = 64.54 GSM | Blown PE is often a LD + LLD blend. Once a roll is in the factory, use measured GSM. RollSpec notes blown PE can run a few percent heavy. Source: RollSpec materials (nominal 0.922). |
| LLDPE | 0.92 g/cm³ (about 0.915–0.930) | Similar to LDPE; often a co-ex sealant | 23 µm × 0.92 = 21.2 GSM (Balaji stretch-film example) | Indian converter Balaji uses 0.92 for cast LLDPE. Treat LD and LLD as separate library items with editable density. Source: [Balaji International, Micron to GSM](https://balajiinternationals.in/packaging-glossary/micron). |
| HDPE | 0.955 g/cm³ (range 0.945–0.965) | 10–70 (often a stiff co-ex layer) | 30 µm × 0.955 = 28.65 GSM | Heavier than LD at the same micron, so it gives less area per kg. Source: RollSpec materials. |
| Aluminium foil | 2.70 g/cm³ (range 2.69–2.71) | 6.35, 7, 9, 12, 15, 20, 25 (India food/pharma often 6–20; 9 is very common) | 9 µm × 2.70 = 24.30 GSM | Foil is much heavier than plastic at the same micron. This GSM is metal only — no lacquer or adhesive. Soft temper 8011 / 1235 is the usual packaging foil. Source: RollSpec materials. |
| Nylon / BOPA | 1.15 g/cm³ (range 1.14–1.16) | 12, 15, 20, 25 | 15 µm = 17.3 GSM (Jindal TDS) | Jindal Nylon Films FILMON BXB (January 2023): density 1.15 g/cc; unit weights 13.8 / 17.3 / 23.0 / 28.8 GSM at 12 / 15 / 20 / 25 µm. Used for puncture and gas barrier, including retort. |
| Paper / kraft | Do not use density — enter mill GSM | Not used for costing. Paper is bought and specified in GSM. | Tea / ORS / pharma sachets typically 40–70 GSM | Never estimate paper GSM from a generic density (Nalyquo). Source: GT Pack Industries, 30 Mar 2026; Nalyquo laminate GSM notes. |
| EVOH | 1.14 g/cm³ for one verified grade. About 1.12–1.19, depends on ethylene content. | Usually a thin co-ex core, about 3–8 µm | Kuraray EVAL E105B (44 mol% ethylene): 1.14 g/cm³ | EVOH density falls as ethylene content rises. Put the grade TDS density in the library. Sources: Kuraray EVAL E105B TDS; CloudFilm range. |

### Ink and adhesive — dry GSM only

Only the dry mass that stays in the laminate belongs in GSM and in material cost. For solvent-based adhesive, wet kg = dry kg ÷ (solids %). For solventless, solids are 100%, so wet = dry. A 3-layer job has two bonds; a 4-layer job has three. Do not add wet coat weight into laminate GSM — RollSpec shows that this overstates a foil laminate by a large margin.

| Item | Typical dry GSM | Source |
| --- | --- | --- |
| Solvent-based dry adhesive (India) | 2.0–2.8 GSM dry per bond (normal film/foil); 3.0–3.5 GSM dry on paper or board | [Cytech Coatings, Gujarat — HILAM GP-50 application guide](https://www.cytechgroup.in/l_general_purpose.php) |
| Solvent-based calculator defaults | 2.5 GSM dry for one bond (2-ply). 5.0 GSM total for two bonds on a 3-ply (about 2.5 each). | GSMCalculator 2-ply and 3-ply tools |
| Solventless PU adhesive | Light 1.2–1.8; medium 1.8–2.2; heavy-duty / retort 2.2–2.8 GSM (100% solids, wet = dry) | Toplusse solventless process guide |
| Gravure ink laydown (starting ranges) | Shallow 1.0–1.2; standard 1.2–1.8; deep / heavy 1.8–2.5 GSM per colour, then × coverage % | GSMCalculator ink tool. Their FAQ also says “wet” — treat as a starting range and prefer measured dry GSM. |
| Flexo ink laydown (starting range) | 0.8–1.5 GSM (same tool). Alliance Printech’s comparison tool defaults are 0.5 (flexo) and 0.4 (gravure) g/m² — those are that tool’s example inputs, not a survey. | GSMCalculator; Alliance Printech flexo vs gravure |
| Printed-job planning example | RollSpec snack-laminate example uses 1.5 GSM average dry ink on the printed area, plus 1.8 GSM dry solventless adhesive. | RollSpec, How to Calculate Laminate GSM |

Ink consumption on a job is **Print area × coverage % × laydown GSM ÷ 1,000**, per colour (GSMCalculator). Coverage starting bands from the same tool: simple text 20–35%, mixed design 40–60%, heavy graphics 60–80%, solid flood 90–100%.

---

## 3. Common Indian structures by end use

These are structures that Indian film makers and converters actually publish. Microns are typical or stated specs, not a national standard. The PrintSahaj calculator should ship with these as presets the owner can edit.

| End use | Common structure | Typical / published microns | Source |
| --- | --- | --- | --- |
| Biscuits, candy, overwrap | BOPP / BOPP, BOPP / MET BOPP, BOPP / CPP, BOPP / MET CPP | Outer BOPP often 15–20 µm; sealant CPP or BOPP 15–25 µm | Cosmo typical laminates (Technokraft sheet); Kanodia |
| Snacks, namkeen, cereals (2-layer) | BOPP / PE or PET / PE | BOPP 18–25 or PET 12; PE 40–70 | Kanodia laminated-films table; GSMCalculator 2-ply presets |
| Potato chips, namkeen, gas-flushed snacks (3-layer) | PET / MET PET / PE; PET / extrusion-PE / MET PET / PE; BOPP / MET PET / PE | PET 12 / MET PET 12 / PE 50 is a common calculator preset. Wahren lists 18 BOPP / 12 MET PET / 90 LDPE natural as a real Indian spec. | Cosmo typical laminates; Wahren, Noida |
| Tea | PET / PE, or PET / MET PET / PE | PET 12; PE as required | Cosmo typical laminates |
| Instant coffee, spices, export dry food, pharma sachets | PET / Alu foil / PE, or PET / extrusion-PE / Alu foil / PE | GT Pack (Greater Noida, 30 Mar 2026): PET 12 µm / Alu 6–20 µm / PE 60–100 µm. Also BOPP 20 / Alu 9–12 / PE 60–80. | GT Pack Industries; Cosmo; MD PET (2026) |
| Pharma / ORS / tea sachets with paper outer | Paper / Alu foil / PE | Paper 40–70 GSM / Alu 9–12 µm / PE 60–80 µm (GT Pack). Wahren examples include 12 µm PET / 17 GSM white PE / 9 µm foil / 35 GSM PE, and heavier 23 PET / 20 foil constructions. | GT Pack; Wahren specifications |
| Edible-oil sachets | PET / foil / PE | Same foil-laminate family as coffee / pharma | MD PET Packaging Group, Oct 2026 |
| Retort, non-microwaveable (India) | PET / Alu / Nylon (BON) / CPP | Floeter India (Manesar): 12 µm PET / 9 µm Alu / 15 µm BON / 70 µm CPP. Floeter states these pouches can withstand retort up to 125 °C for 30 minutes. | Floeter India, Features and Formats |
| Retort, microwaveable (no foil) | AlOx PET / Nylon (BON) / CPP | Floeter: 12 µm AlOx PET / 15 µm BON / 70 µm CPP | Floeter India |
| Retort alternative (foil + CPP, 3-layer) | PET / Alu foil / CPP | GT Pack: PET 12 / Alu 9–12 / CPP 60–80, for 121 °C retort. CPP replaces PE so the seal survives sterilisation. | GT Pack Industries, 30 Mar 2026 |
| Meat, cheese, vacuum, puncture-heavy | Nylon / PE, or PET / Nylon / PE | Nylon 12–15; PE 60. GSMCalculator 3-ply preset: PET 12 / Nylon 15 / PE 60. | Kanodia; GSMCalculator 3-ply |
| Atta, rice, heavy dry packs | PET / PE, PE / PE, PET / MET / PE | Thicker PE for drop strength | Cosmo typical laminates |

---

## 4. Film-area formulas for each pouch type

**First rule, from RollSpec and Aprint:** use outer material dimensions that already include the seal lands. If the customer gives only the inside cavity, add the seal widths first. Typical seal width is 5–10 mm (Aprint). Retort seals are often 8–10 mm (RollSpec). Do not add seals twice.

W, H and G are in millimetres. Area A is in square metres. Film grams = A × laminate GSM. Zipper, spout and valve are added after this, as a per-piece cost and optional grams — they are not in the film area (RollSpec, Nalyquo).

### 3-side seal (3SS / sachet) — two panels, seals already in W and H

**A = 2 × W × H / 1,000,000**

Front and back. A pouch made from one folded web still has two panels, but one long edge is a fold rather than a seal (RollSpec). If the filler needs an inside size, outside W = inside width + two side seals, and outside H = inside height + bottom seal (and top seal if it is already on the pre-made pouch). Aprint: W and H are outside dimensions, seals included.

### Center seal / pillow (VFFS) — web width and cut-off

**Web = 2 × face width + total back-seal allowance + total edge trim**

**A = web × repeat / 1,000,000**, with repeat = pouch length including both cross seals.

Source for the web-width formula: PackagingCalculator.org. Aprint: for rollstock, web width is the tube perimeter plus the longitudinal seal, and repeat is pouch length. Fin seal adds the full seal width; a lap seal adds less because the edges overlap — let the owner pick fin or lap.

### Stand-up / standy / doypack (bottom gusset) — two faces plus unfolded bottom strip (RollSpec)

**A = W × (2H + G) / 1,000,000**

G is the full unfolded bottom depth (40 + 40 folded is entered as 80, not 40). The web the pouch machine consumes is about 2H + G; the repeat is about W. Slit width = 2H + G + 2 × edge trim. Written as W × H + G, for example 160 × 240 + 90 mm (Aprint sizing guide). RollSpec worked example: 150 × 220 mm with a 35+35 mm folded gusset (G = 70) gives A = 0.0765 m². This formula is not for side-gusset, quad-seal or shaped pouches.

### Side-gusset bag — planning approximation, from RollSpec’s perimeter note

**A ≈ H × (2W + 2G) / 1,000,000**

W is the front-panel width with gussets folded; G is the opened-out depth per side. RollSpec: two side gussets add to the width perimeter, not to the height term. Their example: a 150 mm wide, 220 mm high bag with 70 mm side gussets adds 140 mm to a 300 mm (2 × 150) width perimeter. Aprint writes this format as W × H + G per side. This is a rectangular planning model. Shaped bottoms and handles need a measured dieline.

### Flat-bottom, box pouch and quad seal

**No simple published area formula was found that is safe to hard-code.** RollSpec says these formats have four vertical seals and separate side panels, so both the perimeter and the seal-land count change, and their standard calculator does not cover them. Aprint measures a flat-bottom pouch as front W × H plus a side gusset G, with a formed base of W × G.

**Recommendation:** let the owner enter a measured dieline area (cm²). Optionally offer the side-gusset formula as a starting estimate, clearly labelled as incomplete for K-seals and formed bottoms. Do not invent an extra percentage.

### Other formats and add-ons

- **Rollstock:** cost by running metre and by kg. Area = web width × length. The customer's FFS machine forms the pouch; we can still show an optional implied pouch using their cut-off and tube width (Aprint rollstock notes).
- **Wicketed bags:** treat as 3-side seal plus an owner-entered lip height above the opening, and a wicket-hole allowance. No reliable published lip formula was found; the lip must be an input.
- **Zipper:** length is about pouch width (plus a small trim if the plant adds it). Cost is Rs per metre or Rs per piece, owner-entered. Not part of laminate GSM.
- **Spout / cap / coffee valve:** per-piece bought-out cost, owner-entered. May need a small extra film patch — let that be an optional cm² field.

### Layflat and web width

Keep the two directions straight. On a typical single-web stand-up pouch machine, the front, gusset and back are cut across the web, so the slit width is 2H + G plus trim, and the pouch width W is the print repeat along the web (RollSpec). Lane count decides the master printed width: two 570 mm lanes plus 10 mm each side need a 1,160 mm master, not a 1,000 mm roll with huge trim. The gravure cylinder circumference must be a whole multiple of the repeat. Default trim in examples is often 10 mm per edge (RollSpec). This is an input, not a constant. Inter-pouch gaps, if any, add to the repeat.

---

## 5. Costing method, wastage, conversion, cylinders and GST

### From layers to a quote

1. **Build laminate GSM.** Films + dry adhesive at each bond + dry ink.
2. **Weighted material cost.** Cost per m² = sum (layer GSM / 1,000 × that layer's Rs/kg). Then Rs/kg of laminate = cost per m² ÷ (total GSM / 1,000).
3. **Pouch film grams.** Developed area × GSM. Pieces per kg = 1,000 ÷ grams.
4. **Add layout trim.** Slit width, not a waste %. This is real purchased film (RollSpec).
5. **Add process waste, last machine first.** Input = good output ÷ (1 − run waste) + setup metres. Do not add trim again inside this percentage.
6. **Add conversion, tooling, hardware, margin and GST.** Conversion is owner rates. Show first-order vs repeat (cylinder on or off). Show GST separately.

A refinement for serious jobs: the printed outer film enters at the press, but the sealant film enters only at lamination, so the two webs do not need the same length (RollSpec). Version 1 of the website calculator can use one combined kg figure; the quote engine in Flexora should split the webs.

### Wastage — published ranges, not our invention

| Stage | Published figure | How to treat it | Source |
| --- | --- | --- | --- |
| Printing | 2–4% typical (GSMCalculator FAQ). RollSpec worked example uses 3% run waste + 800 m setup. | Owner-editable. Setup metres matter more on short jobs. | GSMCalculator pouch costing FAQ; RollSpec order-quantity guide |
| Lamination | 1–3% typical (GSMCalculator). RollSpec example: 2% + 400 m (includes curing samples). | Same — percentage plus optional setup metres. | Same two sources |
| Slitting | 1–2% typical (GSMCalculator). RollSpec example: 1% + 100 m. | Edge trim from a wrong master width is not this percentage — it is a layout error. | Same two sources |
| Pouching | RollSpec example uses 4% run waste (reel changes included). GSMCalculator's FAQ does not give a pouching percentage. | Label RollSpec's 4% as an illustrative input, which is how RollSpec itself describes it — not an industry benchmark. | RollSpec: illustrative inputs, not industry benchmarks |
| Combined | GSMCalculator: a combined wastage of 3–5% is typical for standard jobs. | Acceptable only as a simple-mode default. Better: stage-wise, last machine first, and compound (input = output ÷ 0.96, not +4% of output). | GSMCalculator |

### Conversion charges per kg — no reliable published Indian schedule

No reliable published Indian schedule of conversion charges per kg (printing, lamination, slitting, pouching) was found. Trade-portal finished-pouch Rs/kg figures mix material and conversion and are not usable as defaults. Alliance Printech's Indian pouch-cost tool builds conversion from machine time, speed, electricity and operators, not from a published Rs/kg list.

PrintSahaj should give empty, owner-editable lines: printing (gravure or flexo), lamination, slitting, pouching — each as Rs/kg or Rs/1,000, plus optional Rs/hour machine time. Example numbers in demos must wear an **Example** badge. After a few jobs, Flexora can replace these with the plant's own history.

### Cylinder and plate cost (India)

| Item | Published or tool figure | Date / notes | Source |
| --- | --- | --- | --- |
| Gravure cylinder, Kanodia Gravure (Delhi) | Rs 2.10 / cm² when circumference is below 750 mm; Rs 2.30 / cm² above 750 mm. Cost = length (cm) × circumference (cm) × rate, then × number of colours. | Published on Kanodia's own price estimator. Page retrieved 12 Nov 2026. Their website formula block is a little garbled (divided by 100); the stated method is area in cm² × Rs/cm², with length and circumference entered in cm. | [kanodiagravure.com/cylinder-costs](https://kanodiagravure.com/cylinder-costs/) |
| Alliance Printech tool defaults (Faridabad) | Gravure engraving default Rs 2.40 / cm². Flexo plate default Rs 1.50 / cm². | These are pre-filled inputs in a free comparison tool, retrieved 12 Nov 2026 — useful starting defaults, not a market survey. The page also explains why gravure tooling dominates short-run cost, and why a break-even quantity exists versus flexo. | [allianceprintech.com/resources/flexo-vs-gravure](https://allianceprintech.com/resources/flexo-vs-gravure/) |

Cylinder cost is a fixed job cost, spread over the order (and over reprints if the same cylinders are reused). On a short first order it can be more than the film. The calculator must show **first-order** and **repeat-order (no cylinder)** side by side.

### GST on flexible packaging in India

For the usual plastic films, laminated plastic films, and plastic pouches, the rate in the current GST schedules is **18%** (9% CGST + 9% SGST, or 18% IGST).

- **HSN 3920** (plain plastic film, not laminated): 18%, Notification 9/2025-Central Tax (Rate), Schedule II, S. No. 121.
- **HSN 3921** (other plates, sheets and film, including flexible laminated / metallised tariff items): 18%, same notification, S. No. 122.
- **HSN 3923** (plastic articles for packing of goods, including bags and pouches): 18%, S. No. 124.

Compiled by [FundRaksha](https://www.fundraksha.com/hsn/hsn-3923) from CBIC Notification 9/2025-CT(R), as of 21 Oct 2026, following the 22 Sep 2025 rate reform. Paper sacks and some biodegradable bags can be 5% under a chapter-wide entry — do not assume 18% for every paper-heavy pack. Foil-heavy constructions can raise a classification question (Chapter 76 versus 39). The quote PDF should default to 18% and tell the owner to confirm HSN with their CA. **This document is not tax advice.**

---

## 6. Existing calculators — India first, then international

Each URL below returned HTTP 200 on 12 Nov 2026, except where noted. “Best to copy” means ideas, not their code or paid content.

### India

| Tool | What it does well | Gaps | Copy for PrintSahaj? |
| --- | --- | --- | --- |
| [GSMCalculator Packtools](https://gsmcalculator.com/packtools/). Free web. Currency examples in AED, but the formulas are general. 2-ply, 3-ply, 4-ply, pouch weight, pouch costing, ink, cylinder, roll tools. All listed pages loaded (200). | Layer-by-layer GSM and cost per m²; adhesive defaults (2.5 / 5.0 GSM); common Indian-style structure presets; ink coverage bands; wastage FAQ with percentage ranges; cylinder amortisation. | The pouch-weight page describes area as width × height — that can under-count a two-panel pouch. Stand-up gusset, side gusset and zipper are weak or missing. Not a saved rate-book for an Indian owner. | Yes — structure presets, adhesive defaults, ink coverage, 2/3/4-ply layout. Do not copy a one-panel area formula. |
| [Agarwal Packaging System, Chennai](https://www.agarwalpackagingsystem.in/calculators/blank). Free pouch and film cost calculator. Loaded (200). | Indian, simple, and in the right language of the trade: pillow / centre-seal or 3-side seal, layers with micron and Rs/kg, printing and lamination, wastage, extra per pouch, margin, cost per pouch and per 1,000. | Only two pouch types. No standy, zipper or foil-specific guidance on the public page. Built to sell packing machines, not to be a full converter tool. | Yes — the simple input order and the selling-price-with-margin output. |
| [Alliance Printech pouch cost](https://allianceprintech.com/resources/pouch-cost-calculator/) and [Flexo vs gravure](https://allianceprintech.com/resources/flexo-vs-gravure/). Faridabad press maker. Both loaded (200). | Costs a job from film, plates or cylinders, ink, press time and converting time. The comparison tool shows a break-even quantity between flexo and gravure — something PrintSahaj can offer as a teaching feature. | Full breakdown is emailed; it is a press-sales tool. Defaults (Rs 2.40/cm², Rs 1.50/cm²) are examples. Not a structure library. | Yes — first-order vs repeat, flexo vs gravure break-even, tooling spread. |
| [Kanodia Gravure cylinder estimator, Delhi](https://kanodiagravure.com/cylinder-costs/). Loaded (200). | A real Indian published Rs/cm² rate, with a circumference split at 750 mm. | Cylinders only, not pouch costing. | Yes — use as a labelled default the owner can overwrite. |
| [Wiserobe Flexible Packaging Toolkit](https://shop.wiserobe.com/30dpc/flexpackkit/). Paid Excel, Rs 149 + add-ons. Sales page loaded (200). Seller: AVSVishal Media, Jaipur. | Closest Indian product to a full converter workbook: layflat by pouch style, micron-to-GSM, structure cost, ink and adhesive, cylinder share, printing / lamination / slitting / making, stage wastage, zipper and spout, cost per 1,000, slab rates, quotation, profit. Rates are the user's (yellow input cells). | Paid download, not a free web magnet. Job-card / CRM / stock kits are add-ons — those belong in Flexora, not on the free PrintSahaj site. Earlier review also flagged checkout dark patterns; we copy costing ideas only. | Yes — the costing workflow and owner-rate design. No for job cards and CRM on the free site. |
| [Gedgetsworld toolkit](https://gedgetsworld.in/sp/flexible-packaging-costing-quotation-production-control-toolkit). Paid pack, Agra seller. Page loaded (200). | Similar pitch: costing plus production templates. | Earlier review found fewer real calculators, generic Excel templates, and a refund policy that contradicts the 30-day guarantee. Weaker model to copy. | Little — do not follow this product design. |

### International

| Tool | What it does well | Gaps | Copy for PrintSahaj? |
| --- | --- | --- | --- |
| [RollSpec tools](https://rollspec.com/tools/) and [pouch-weight guide](https://rollspec.com/guides/pouch-weight/). Engineering calculators and long worked guides. Loaded (200). Last technical review on the tools page: 5 Sep 2026. | The most careful free treatment found: correct stand-up formula, seal-land warning, trim versus process waste, waste worked backwards with setup metres, different entry points for PET and PE webs, adhesive dry vs wet, and explicit illustrative-not-a-benchmark labels. | Not an Indian rate book. Side-gusset and box pouch are explained in words, not fully calculated. No quote PDF or GST. | Yes — this should be the engineering backbone of our formulas and warnings. |
| [Nalyquo laminate GSM](https://nalyquo.com/calculators/laminate-gsm/), pouch-weight, and the full flexible suite. Large free suite. Loaded (200). Pages dated Oct 2026. | Up to six layers; dry adhesive, ink and coating as separate lines; paper must be real GSM; pouch weight can use production web (width × repeat ÷ lanes × GSM) or a flat estimate; assumptions are written on the page. | Flat estimate is not a gusset model. No Indian GST or cylinder Rs/cm². Many tools are purchasing-oriented. | Yes — web-vs-flat methods, assumption footnotes, adhesive solids, price per kg vs per m². |
| [Microflex Film, US](https://microflexfilm.com/calculators). 15 free estimators. Loaded (200). | Excellent format picker, barrier selector and pouch-size intuition, with diagrams. Good teaching UX. | Not a converter costing tool. No GSM stack, no Rs/kg, no Indian structures. | Yes — pouch-type diagrams and a simple which-structure-for-this-product helper. |
| [PackagingCalculator.org web width](https://packagingcalculator.org/calculators/packaging-film-web-width/). Loaded (200). Also has pouch capacity, roll length, repeat tools. | Clear center-fold web-width formula with seal and trim as totals, not per-side traps. | Not a full cost sheet. | Yes — the web-width inputs and wording. |
| Cerm, Kiwiplan, PCMC, ePac, Flexible Packaging Association | Cerm is a paid print / flex-pack MIS. Kiwiplan is mainly corrugate MES. PCMC builds pouch and bag machines. ePac is a converter network. FPA is a trade association. All are relevant names in the industry. | No public costing calculator was found on these sites during this research. They should not be listed to a user as free tools they can open today. | No public formula to copy. Flexora, later, can learn from what a MIS tracks (job ticket, actual vs estimate) — not from a public calculator. |

**Bottom line:** no free tool already does Indian 2/3/4-layer structure + every pouch type + zipper + owner-saved rates + GST + quote PDF in one place. That is the gap PrintSahaj should fill. The best engineering source is RollSpec; the best Indian workflow inspiration is Wiserobe's costing sheet and Agarwal's simplicity; the best published cylinder rupees are Kanodia's.

---

## 7. Recommended calculator design for printsahaj.com

Six free tools, one shared rate book. Serious production control stays in Flexora.

### Screen 1 — Structure builder

Preset Indian structures (chips, coffee, pharma, retort, biscuits), fully editable. Layer picker: PET, BOPP, MET PET, MET BOPP, CPP, LDPE, LLDPE, HDPE, Alu foil, BOPA, paper (GSM), EVOH, custom. Each film layer: micron + density (library default, owner can change) or a measured GSM override. An adhesive row appears automatically between every two films. Default dry GSM from Cytech / GSMCalculator; solvent-based or solventless (solids %). Ink: colours, coverage %, dry laydown, optional white underprint. Live result: total GSM, yield m²/kg, Rs/m² and Rs/kg at the owner's film rates.

### Screen 2 — Pouch type and size

Picker with a small diagram: 3SS, center-seal / pillow, standy (bottom gusset), side gusset, flat-bottom / quad (dieline area), rollstock, wicketed. W, H, G. Toggle: these are outer sizes (default) or these are inside, add seals. Seal width default 8 mm, editable (5–10 mm sourced range). G for standy is unfolded depth, with a helper: if your gusset is 40+40 folded, type 80. Fin vs lap for center seal. Lip height for wicketed. Dieline cm² for box / quad. Zipper, spout, valve: on/off, Rs/piece (and optional grams). Show developed area, slit width, suggested repeat, and a warning if cylinder circumference is not a multiple of the repeat.

### Screen 3 — Quantity, waste, rates

Order quantity, lanes, edge trim (default 10 mm/side, labelled as a common example from RollSpec), optional setup metres. Waste by stage, with sourced starting ranges and a clear not-a-benchmark note. Simple mode: one combined 3–5% default from GSMCalculator. Rate book (login to save): Rs/kg per film, adhesive, ink; conversion lines empty or last-saved; cylinder Rs 2.10 / Rs 2.30 default from Kanodia, flexo plate Rs 1.50 default from Alliance, both labelled. Margin %. GST 18% default, editable. All defaults that are money must show an **Example** or starting-default-change-me tag until the owner saves their own.

### Screen 4 — Outputs and the lead gate

Grams per pouch (film only, and film + zipper), pieces/kg, kg of each web to buy, cost per pouch, per 1,000, per kg. First-order vs repeat (cylinder / plate on or off). Slab rates at 10k, 25k, 50k, 100k if they type a margin. Breakdown: material, conversion, tooling share, hardware, waste, margin. GST shown separately. Free on-screen result for tools 1–5 (structure, pouch cost, roll/label cost, cylinder spread, ink and adhesive). Lead form before Quote PDF: name, WhatsApp, company, city. PDF with PrintSahaj logo, GST split, and a Flexora demo line. Saving a permanent rate book also requires a login — that is the second lead moment.

### Keep off the free site

Job cards, CRM, film stock, worker attendance and production tracking belong in **Flexora**, offered after the quote PDF or a saved rate book.

---

## 8. Worked example — 3-layer standy with zipper

**All rupee rates below are examples only**, except the cylinder rate. GSM, densities and the area formula are sourced. The Rs/kg and conversion figures are not market prices and were not taken from any supplier quote. They exist so the arithmetic is visible and checkable. An owner must replace every rupee with their own rate.

### Inputs

| Input | Value | Why this value |
| --- | --- | --- |
| Pouch | Stand-up, 160 × 240 + 80 mm, with zipper. Quantity 50,000. Outer sizes, seals already included. | Aprint notation W × H + G. G = 80 mm unfolded (for example 40+40 folded), as RollSpec requires. |
| Structure | PET 12 / MET PET 12 / LDPE 70, two adhesive bonds, printed. | A common Indian 3-layer snack / coffee barrier style (Cosmo, GSMCalculator, Wahren family). Microns chosen as a typical preset, not a customer's actual TDS. |
| Densities and coat weights | PET 1.40; MET PET 1.40 + 0.80 GSM metal; LDPE 0.922; adhesive 2.50 dry × 2 bonds; ink 1.50 dry average. | PET: Cosmo CF-B0-CPF. Metal add-on: mid-point of CloudFilm's 0.5–1.0 GSM (labelled assumption). LDPE: RollSpec 0.922. Adhesive: Cytech / GSMCalculator 2.5. Ink: RollSpec snack example 1.5 dry. |
| Trim and waste | 10 mm edge trim each side. Combined process waste 5% of input after trim (simple mode). | 10 mm is RollSpec's worked-example trim, used here as an example input. 5% is the top of GSMCalculator's typical combined 3–5%. Setup metres are left out in this simple run; a short job should add them. |
| Example rates (Example — not sourced, except the cylinder rate) | PET Rs 145/kg, MET PET Rs 185/kg, LDPE Rs 125/kg, adhesive Rs 400/kg dry, ink Rs 550/kg dry, conversion Rs 76/kg total (print 28 + lam 18 + slit 8 + pouch 22), zipper Rs 0.90/piece, 6 gravure colours, margin 15%. | Invented for the demonstration. Cylinder rate is the one money exception: Rs 2.10/cm² from Kanodia, because circumference 640 mm is below 750 mm. |

### Step 1 — Laminate GSM (sourced arithmetic)

| Layer | Calculation | GSM |
| --- | --- | ---: |
| PET 12 µm | 12 × 1.40 | 16.80 |
| MET PET 12 µm + metal | 12 × 1.40 + 0.80 | 17.60 |
| LDPE 70 µm | 70 × 0.922 | 64.54 |
| Dry adhesive, two bonds | 2.50 + 2.50 | 5.00 |
| Dry ink (average) | 1.50 | 1.50 |
| **Total laminate** | 16.80 + 17.60 + 64.54 + 5.00 + 1.50 | **105.44 g/m²** |

Yield = 1,000 ÷ 105.44 = **9.484 m²/kg**.

### Step 2 — Film area and grams (RollSpec formula)

**A = 160 × (2 × 240 + 80) / 1,000,000 = 160 × 560 / 1,000,000 = 0.0896 m²**

Film grams (blank) = 0.0896 × 105.44 = 9.4474 g. Theoretical pieces/kg = 1,000 / 9.4474 = 105.85. Web the machine consumes = 2H + G = 560 mm. With 10 mm trim each side, slit width = 580 mm. Repeat = 160 mm (no gap in this example).

**Purchased area = 160 × 580 / 1,000,000 = 0.0928 m². Grams with trim = 0.0928 × 105.44 = 9.7848 g. Good film for 50,000 pouches = 50,000 × 9.7848 / 1,000 = 489.24 kg.**

This 3.45% is layout trim, already purchased. It is not added again as process waste.

### Step 3 — Process waste (simple mode). 5% of input, after trim

**Input kg = 489.24 ÷ 0.95 = 515.00 kg** (489.24 / 0.95 = 514.99, rounded to 515.00). Input area is about 515.00 ÷ 105.44 × 1,000 = 4,884 m².

A fuller plant model would compound 3% print, 2% lam, 1% slit and 4% pouch from the last machine backwards, and would buy a slightly shorter PE web than PET web. That is the Flexora-grade version.

### Step 4 — Material and conversion rupees (Example rates)

| Line | Calculation | Rs / m² |
| --- | --- | ---: |
| PET | 16.80 / 1,000 × 145 | 2.436 |
| MET PET | 17.60 / 1,000 × 185 | 3.256 |
| LDPE | 64.54 / 1,000 × 125 | 8.0675 |
| Adhesive | 5.00 / 1,000 × 400 | 2.000 |
| Ink | 1.50 / 1,000 × 550 | 0.825 |
| **Material** | sum, then × 1,000 / 105.44 = **Rs 157.29 / kg** | **16.5845** |

| Cost line for 50,000 pouches | Calculation | Amount |
| --- | --- | ---: |
| Material, including trim and 5% waste | 515.00 kg × Rs 157.29 | Rs 81,004 |
| Conversion (Example) | 515.00 × Rs 76 | Rs 39,140 |
| Gravure cylinders, first order (6 colours). Circumference 640 mm (4 × 160 mm repeat), face length 600 mm assumed for a 580 mm slit plus margin. Area = 64 cm × 60 cm = 3,840 cm². Rate Rs 2.10 (Kanodia, below 750 mm). | 3,840 × 2.10 × 6 | Rs 48,384 |
| Zipper (Example) | 50,000 × Rs 0.90 | Rs 45,000 |
| **Total factory cost, first order** | 81,004 + 39,140 + 48,384 + 45,000 | **Rs 2,13,528** |
| **Repeat order (no new cylinders)** | 2,13,528 − 48,384 | **Rs 1,65,144** |

### Step 5 — Per pouch, margin and GST

| Output | First order | Repeat order |
| --- | ---: | ---: |
| Cost per pouch | Rs 4.27 | Rs 3.30 |
| Cost per 1,000 | Rs 4,271 | Rs 3,303 |
| Selling price at 15% margin, before GST (Example margin) | Rs 4.91 / pouch | Rs 3.80 / pouch |
| GST 18% (HSN typically 3923 for pouches) | Rs 0.88 | Rs 0.68 |
| Invoice price including GST | Rs 5.79 / pouch | Rs 4.48 / pouch |

**Headline figures (Example rates, 50,000 pcs):**

- First-order cost / pouch: **Rs 4.27**
- Repeat-order cost / pouch: **Rs 3.30**
- Cylinder share / pouch: **Rs 0.97** (why first and repeat must differ)
- Laminate GSM: **105.44** (sourced densities and coat weights)

Rounded to the nearest paisa from Rs 2,13,528 ÷ 50,000 = Rs 4.2706, then × 1.15 = Rs 4.9111, then × 1.18 = Rs 5.7951. Cylinder share on the first order is Rs 0.97 per pouch — that is why a 50,000 first run and a repeat run must not be quoted at the same rate. Zipper weight is not in the 9.78 g film figure. If the plant sells on finished empty-pouch weight, the owner adds a measured zipper mass (weigh 20 finished pouches, as RollSpec recommends).

---

## 9. Sources, opened 12 Nov 2026

Research started with Indian film makers, adhesive makers, converters and GST compilations, then international engineering calculators. HTTP 200 was confirmed with a request on 12 Nov 2026 unless noted. Densities are typical or TDS values for named grades, not purchasing specifications. Replace them with the owner's supplier TDS or a weighed GSM. Conversion Rs/kg and film Rs/kg are not published as a trustworthy Indian schedule in the sources above. GST classification of unusual foil or paper packs should be confirmed with a qualified professional.

1. [Cosmo Films CF-B0-CPF BOPET TDS — density 1.40 g/cc, GSM by thickness (HTTP 200)](https://www.cosmofilms.com/public/uploads/pdf/1708359434.pdf)
2. [Cosmo Films PCT-2(M) matte BOPP TDS — density 0.84 g/cc on a matte grade](https://www.cosmofilms.com/public/uploads/pdf/1708540508.pdf)
3. [Cosmo typical laminate structures, hosted by Technokraft (HTTP 200)](https://www.technokraftgroup.com/download/spec/cosmofilms/sheet.pdf)
4. [Jindal Nylon Films FILMON BXB TDS, January 2023 — density 1.15, 12–25 µm (content retrieved; a raw curl to this URL did not always complete)](https://www.jindalnylonfilms.com/wp-content/uploads/2023/03/FILMON%C2%AE-BXB-TDS-JNF-January-2023.pdf)
5. [Kuraray EVAL E105B TDS — EVOH density 1.14 g/cm³ (HTTP 200)](https://eval.kuraray.com/wp-content/uploads/2021/11/tds_eval_E105B.pdf)
6. [RollSpec film density and yield table (HTTP 200)](https://rollspec.com/materials/)
7. [RollSpec laminate GSM guide](https://rollspec.com/guides/laminate-gsm/)
8. [RollSpec pouch-weight guide — stand-up formula and seal-land warning](https://rollspec.com/guides/pouch-weight/)
9. [RollSpec adhesive consumption — dry vs wet, solids %](https://rollspec.com/guides/adhesive-consumption/)
10. [RollSpec order quantity and waste — stage-wise, last machine first, labelled illustrative](https://rollspec.com/guides/order-quantity-from-pouch-count/)
11. [CloudFilm density, metallised add-on 0.5–1.0 GSM, EVOH range (HTTP 200)](https://www.cloudflexfilm.com/flexible-film-density-formulas-tables-yield/)
12. [Balaji International, India — micron to GSM (page retrieved; some automated fetches returned 403)](https://balajiinternationals.in/packaging-glossary/micron)
13. [Cytech Coatings, Gujarat — solvent-based dry coat weights 2.0–2.8 and 3.0–3.5 GSM (HTTP 200)](https://www.cytechgroup.in/l_general_purpose.php)
14. [Toplusse solventless coat-weight bands (HTTP 200)](https://www.toplusse.com/blog/solventless-lamination-process-guide-for-films--toplusse-technical-white-paper---first-edition)
15. [GT Pack Industries, Greater Noida, 30 Mar 2026 — foil structures and microns (HTTP 200)](https://www.gtpackexim.com/blog/aluminium-foil-laminate-the-technical-guide-for-food-brands-pharma-buyers-amp-exporters)
16. [Wahren, Noida — published laminate specifications (HTTP 200)](https://www.wahren.in/multi-layer-laminates/)
17. [Kanodia Technoplast — structure-by-application table (HTTP 200)](https://kanodiaindia.com/laminated-films/)
18. [MD PET Packaging Group, 26 Oct 2026 — FMCG laminate choices in India](https://mdpet.in/blog/choosing-the-right-flexible-laminate-structure-for-fmcg-packaging-in-india-2026/)
19. [Floeter India retort pouch specifications (HTTP 200)](https://www.floeterindia.com/products/features-formats/)
20. [Aprint sizing guide — how each pouch format is measured (HTTP 200)](https://aprint.mx/en/technical-center/sizing-guide/)
21. [PackagingCalculator.org film web width (HTTP 200)](https://packagingcalculator.org/calculators/packaging-film-web-width/)
22. [Kanodia Gravure cylinder rates Rs 2.10 / Rs 2.30 per cm² (HTTP 200)](https://kanodiagravure.com/cylinder-costs/)
23. [Alliance Printech flexo vs gravure tool (HTTP 200)](https://allianceprintech.com/resources/flexo-vs-gravure/)
24. [Alliance Printech pouch cost calculator (HTTP 200)](https://allianceprintech.com/resources/pouch-cost-calculator/)
25. [FundRaksha HSN 3920 — GST 18%, Notification 9/2025-CT(R), as of 21 Oct 2026](https://www.fundraksha.com/hsn/hsn-3920)
26. [FundRaksha HSN 3921 — GST 18%](https://www.fundraksha.com/hsn/hsn-3921)
27. [FundRaksha HSN 3923 — GST 18% on plastic packing articles](https://www.fundraksha.com/hsn/hsn-3923)
28. [GSMCalculator Packtools — free laminate, pouch, ink and cylinder tools (HTTP 200)](https://gsmcalculator.com/packtools/)
29. [Agarwal Packaging System, Chennai — pouch and film cost calculator (HTTP 200)](https://www.agarwalpackagingsystem.in/calculators/blank)
30. [Nalyquo laminate GSM calculator (HTTP 200)](https://nalyquo.com/calculators/laminate-gsm/)
31. [Nalyquo pouch weight calculator (HTTP 200)](https://nalyquo.com/calculators/pouch-weight/)
32. [Microflex Film packaging calculators (HTTP 200)](https://microflexfilm.com/calculators)
33. [Wiserobe Flexible Packaging Toolkit sales page (HTTP 200)](https://shop.wiserobe.com/30dpc/flexpackkit/)
34. [Gedgetsworld flexible packaging toolkit sales page (HTTP 200)](https://gedgetsworld.in/sp/flexible-packaging-costing-quotation-production-control-toolkit)

---

*PrintSahaj research document. Prepared 12 Nov 2026 (Asia/Calcutta). This is not tax advice, and example rupee rates are not market prices.*
