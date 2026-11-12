/**
 * Excel-compatible path — a faithful copy of the reference Indian printer
 * workbook (docs/flexible-packaging-calculators/02-reference-excel-analysis.md).
 *
 * It exists for the golden tests and for an optional "Excel-compatible"
 * comparison in Advanced mode. It is NOT the product default and it is
 * deliberately not "corrected":
 *
 *   GSM            = excel density × microns
 *   QTY RMC        = GSM_film / GSM_first        (first film = 1)
 *   RATE film      = ₹/kg × QTY RMC
 *   RATE ink/adh   = GSM × ₹/kg                  ← the workbook's shortcut
 *   Cost per kg    = (Σ RATE + wastage on Σ RATE) / Σ QTY RMC
 *   area           = W × H × 2 / 1,000,000       (3-side seal only)
 *   pouches per kg = (1000 / Σ GSM) / area
 *   cost per pouch = Cost per kg / pouches per kg
 *   then + pouching ₹ + zipper ₹, packing %, optional second wastage, profit %.
 *
 * Arithmetic follows the sheet's own operation order so the floats match.
 */

/** Densities hard-coded in the workbook's GSM formulas. Not TDS values. */
export const EXCEL_DENSITIES = {
  PET: 1.41,
  "MET PET": 1.41,
  POLY: 0.923,
  BOPP: 0.91,
  BOPA: 1.15,
  "AL.FOIL": 2.71,
} as const;

export type ExcelMaterial = keyof typeof EXCEL_DENSITIES;

export interface ExcelFilm {
  material: ExcelMaterial;
  microns: number;
  ratePerKg: number;
}

/**
 * How the block stores wastage:
 *   "fraction" — cell holds 0.1 and the formula is  H × G
 *   "percent"  — cell holds 10  and the formula is  H × G / 100
 */
export type ExcelWastageConvention = "fraction" | "percent";

export interface ExcelJobInput {
  /** Films in sheet order. The first one is the QTY RMC reference. */
  films: ExcelFilm[];
  /** Typed GSM. 0 when the cell is blank. */
  inkGsm: number;
  inkRatePerKg: number;
  adhesiveGsm: number;
  adhesiveRatePerKg: number;
  wastage: number;
  wastageConvention: ExcelWastageConvention;
  /** mm */
  pouchWidth: number;
  /** mm */
  pouchHeight: number;
  /** ₹ per pouch */
  pouchingCharge: number;
  /** ₹ per pouch. Empty (0) in every job of the workbook. */
  zipperCharge?: number;
  /** As a fraction, e.g. 0.01 for 1%. */
  packing: number;
  /** As a fraction. Only Job 1 has it. */
  secondWastage?: number;
  /** As a fraction, e.g. 0.2 for 20%. */
  profit: number;
}

export interface ExcelJobResult {
  filmGsm: number[];
  qtyRmc: number[];
  totalGsm: number;
  sumQtyRmc: number;
  sumRate: number;
  wastageRate: number;
  costPerKg: number;
  yieldM2PerKg: number;
  pouchAreaM2: number;
  pouchesPerKg: number;
  filmCostPerPouch: number;
  afterPouching: number;
  afterPacking: number;
  afterSecondWastage: number;
  finalPerPouch: number;
}

export function computeExcelJob(job: ExcelJobInput): ExcelJobResult {
  const filmGsm = job.films.map((film) => EXCEL_DENSITIES[film.material] * film.microns);
  const firstGsm = filmGsm[0];
  const qtyRmc = filmGsm.map((gsm, index) => (index === 0 ? 1 : gsm / firstGsm));
  const filmRates = job.films.map((film, index) => film.ratePerKg * qtyRmc[index]);

  // =SUM(...) down the column: films, then ink, then adhesive.
  let totalGsm = 0;
  for (const gsm of filmGsm) totalGsm += gsm;
  totalGsm += job.inkGsm;
  totalGsm += job.adhesiveGsm;

  let sumQtyRmc = 0;
  for (const qty of qtyRmc) sumQtyRmc += qty;

  let sumRate = 0;
  for (const rate of filmRates) sumRate += rate;
  sumRate += job.inkGsm * job.inkRatePerKg;
  sumRate += job.adhesiveGsm * job.adhesiveRatePerKg;

  const wastageRate =
    job.wastageConvention === "fraction" ? sumRate * job.wastage : (sumRate * job.wastage) / 100;
  const costPerKg = (sumRate + wastageRate) / sumQtyRmc;

  const yieldM2PerKg = 1000 / totalGsm;
  const pouchAreaM2 = (job.pouchWidth * job.pouchHeight * 2) / 1000000;
  const pouchesPerKg = yieldM2PerKg / pouchAreaM2;
  const filmCostPerPouch = costPerKg / pouchesPerKg;

  const afterPouching = filmCostPerPouch + job.pouchingCharge + (job.zipperCharge ?? 0);
  const afterPacking = afterPouching + afterPouching * job.packing;
  const afterSecondWastage =
    job.secondWastage && job.secondWastage > 0 ? afterPacking + afterPacking * job.secondWastage : afterPacking;
  const finalPerPouch = afterSecondWastage * job.profit + afterSecondWastage;

  return {
    filmGsm,
    qtyRmc,
    totalGsm,
    sumQtyRmc,
    sumRate,
    wastageRate,
    costPerKg,
    yieldM2PerKg,
    pouchAreaM2,
    pouchesPerKg,
    filmCostPerPouch,
    afterPouching,
    afterPacking,
    afterSecondWastage,
    finalPerPouch,
  };
}

/** The six worked jobs of the reference workbook, exactly as typed in the sheets. */
export const EXCEL_REFERENCE_JOBS: Record<string, { title: string; input: ExcelJobInput }> = {
  job1: {
    title: "Job 1 — COSTING block 1, PET 12 / POLY 40, 250 × 70",
    input: {
      films: [
        { material: "PET", microns: 12, ratePerKg: 130 },
        { material: "MET PET", microns: 0, ratePerKg: 145 },
        { material: "POLY", microns: 40, ratePerKg: 135 },
        { material: "BOPA", microns: 0, ratePerKg: 265 },
        { material: "AL.FOIL", microns: 0, ratePerKg: 460 },
      ],
      inkGsm: 2,
      inkRatePerKg: 75,
      adhesiveGsm: 2,
      adhesiveRatePerKg: 62.5,
      wastage: 0.1,
      wastageConvention: "fraction",
      pouchWidth: 250,
      pouchHeight: 70,
      pouchingCharge: 0.05,
      packing: 0.01,
      secondWastage: 0.05,
      profit: 0.2,
    },
  },
  job2: {
    title: "Job 2 — COSTING block 2, Himalaya facial wipes, PET 12 / POLY 55, 150 × 90",
    input: {
      films: [
        { material: "PET", microns: 12, ratePerKg: 130 },
        { material: "MET PET", microns: 0, ratePerKg: 155 },
        { material: "POLY", microns: 55, ratePerKg: 120 },
      ],
      inkGsm: 2,
      inkRatePerKg: 90,
      adhesiveGsm: 2,
      adhesiveRatePerKg: 62.5,
      wastage: 10,
      wastageConvention: "percent",
      pouchWidth: 150,
      pouchHeight: 90,
      pouchingCharge: 0.04,
      packing: 0.02,
      profit: 0.2,
    },
  },
  job3: {
    title: "Job 3 — COSTING block 3, Turbo Chrome 8M (matt BOPP), BOPP 20 / POLY 30, 145 × 150",
    input: {
      films: [
        { material: "BOPP", microns: 20, ratePerKg: 135 },
        { material: "MET PET", microns: 0, ratePerKg: 130 },
        { material: "POLY", microns: 30, ratePerKg: 145 },
      ],
      inkGsm: 2,
      inkRatePerKg: 62.5,
      adhesiveGsm: 2,
      adhesiveRatePerKg: 62.5,
      wastage: 7,
      wastageConvention: "percent",
      pouchWidth: 145,
      pouchHeight: 150,
      pouchingCharge: 0.06,
      packing: 0.02,
      profit: 0.1,
    },
  },
  job4: {
    title: "Job 4 — ALFOIL COSTING, PET 12 / Alu 9 / PET 12 / POLY 40, 50 × 75",
    input: {
      films: [
        { material: "PET", microns: 12, ratePerKg: 120 },
        { material: "AL.FOIL", microns: 9, ratePerKg: 450 },
        { material: "PET", microns: 12, ratePerKg: 120 },
        { material: "POLY", microns: 40, ratePerKg: 130 },
      ],
      inkGsm: 0,
      inkRatePerKg: 75,
      adhesiveGsm: 6,
      adhesiveRatePerKg: 62.5,
      wastage: 15,
      wastageConvention: "percent",
      pouchWidth: 50,
      pouchHeight: 75,
      pouchingCharge: 0.05,
      packing: 0.02,
      profit: 0.15,
    },
  },
  job5: {
    title: "Job 5 — Sheet3, MD Foods plain pouches, PET 12 / MET PET 12 / POLY 80, 280 × 380",
    input: {
      films: [
        { material: "PET", microns: 12, ratePerKg: 126 },
        { material: "MET PET", microns: 12, ratePerKg: 142 },
        { material: "POLY", microns: 80, ratePerKg: 126 },
      ],
      inkGsm: 0,
      inkRatePerKg: 62.5,
      adhesiveGsm: 4,
      adhesiveRatePerKg: 62.5,
      wastage: 10,
      wastageConvention: "percent",
      pouchWidth: 280,
      pouchHeight: 380,
      pouchingCharge: 0.035,
      packing: 0.02,
      profit: 0.1,
    },
  },
  job6: {
    title: "Job 6 — ankur, Super Regulator, PET 12 / POLY 40, 235 × 245",
    input: {
      films: [
        { material: "PET", microns: 12, ratePerKg: 139 },
        { material: "MET PET", microns: 0, ratePerKg: 159 },
        { material: "POLY", microns: 40, ratePerKg: 134 },
      ],
      inkGsm: 2,
      inkRatePerKg: 62.5,
      adhesiveGsm: 2,
      adhesiveRatePerKg: 62.5,
      wastage: 0.1,
      wastageConvention: "fraction",
      pouchWidth: 235,
      pouchHeight: 245,
      pouchingCharge: 0.06,
      packing: 0.01,
      profit: 0.2,
    },
  },
};
