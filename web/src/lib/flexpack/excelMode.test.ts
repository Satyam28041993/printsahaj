/**
 * Golden tests A — the Excel-compatible path must reproduce the reference
 * printer workbook. Expected values are the cached cell values of
 * docs/flexible-packaging-calculators/reference/printer-costing-sample.xls
 * (re-read with xlrd on 12 Nov 2026). Do not edit a golden number to make a
 * test pass — fix the code, or ask Satyam and show the sheet cell.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeExcelJob, EXCEL_REFERENCE_JOBS } from "./excelMode";

/** Relative tolerance: tighter than any rounding a user could see. */
const REL = 1e-12;

function close(actual: number, expected: number, label: string): void {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= Math.abs(expected) * REL,
    `${label}: got ${actual}, sheet has ${expected} (diff ${diff})`,
  );
}

const round = (value: number, decimals: number): number => Number(value.toFixed(decimals));

test("Job 1 — PET 12 / POLY 40, 250 × 70 (primary golden test)", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job1.input);
  close(r.totalGsm, 57.84, "E11 total GSM");
  close(r.sumQtyRmc, 3.1820330969267143, "F11 sum QTY RMC");
  close(r.costPerKg, 241.8365527488856, "H14 cost of laminate");
  close(r.yieldM2PerKg, 17.289073305670815, "E17 m²/kg");
  close(r.pouchAreaM2, 0.035, "E22 pouch area");
  close(r.pouchesPerKg, 493.9735230191661, "E24 pouches/kg");
  close(r.filmCostPerPouch, 0.48957391738484407, "E26 film cost/pouch");
  close(r.afterPouching, 0.5395739173848441, "E30 after pouching");
  close(r.afterPacking, 0.5449696565586925, "E34 after packing");
  close(r.afterSecondWastage, 0.572218139386627, "E38 after 5% wastage");
  close(r.finalPerPouch, 0.6866617672639524, "E41 final");

  // The figures a user would quote.
  assert.equal(round(r.costPerKg, 2), 241.84);
  assert.equal(Math.round(r.pouchesPerKg), 494);
  assert.equal(round(r.finalPerPouch, 4), 0.6867);
});

test("Job 2 — Himalaya facial wipes, PET 12 / POLY 55, 150 × 90", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job2.input);
  close(r.totalGsm, 71.685, "E53");
  close(r.costPerKg, 218.618600871685, "H56");
  close(r.pouchesPerKg, 516.6636958504156, "E66");
  close(r.finalPerPouch, 0.5668774956864296, "E80");
  assert.equal(r.afterSecondWastage, r.afterPacking, "no second wastage in this block");
});

test("Job 3 — Turbo Chrome 8M (matt BOPP), BOPP 20 / POLY 30, 145 × 150", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job3.input);
  close(r.totalGsm, 49.89, "E90");
  close(r.costPerKg, 256.99702549575073, "H93");
  close(r.pouchesPerKg, 460.783839389185, "E103");
  close(r.finalPerPouch, 0.6931029332479846, "E117");
});

test("Job 4 — ALFOIL COSTING, PET 12 / Alu 9 / PET 12 / POLY 40, 50 × 75", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job4.input);
  close(r.totalGsm, 101.15, "D8");
  close(r.sumQtyRmc, 5.623522458628842, "E8");
  close(r.costPerKg, 316.4270625328429, "G11");
  close(r.pouchesPerKg, 1318.1743285549514, "D21");
  close(r.finalPerPouch, 0.34022804040829613, "D35");
});

test("Job 5 — MD Foods plain pouches, PET 12 / MET PET 12 / POLY 80, 280 × 380", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job5.input);
  close(r.totalGsm, 111.68, "E7");
  close(r.costPerKg, 184.5768945022288, "H10");
  close(r.pouchesPerKg, 42.07779477346662, "E20");
  close(r.filmCostPerPouch, 4.386562924600296, "E22");
  close(r.finalPerPouch, 4.960993601401532, "E34");
  // The sheet's side note "= 3.90 each" is a quoted price, not the formula output.
  assert.notEqual(round(r.finalPerPouch, 2), 3.9);
});

test("Job 6 — Super Regulator, PET 12 / POLY 40, 235 × 245", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job6.input);
  close(r.totalGsm, 57.84, "E10");
  close(r.costPerKg, 235.55118870728083, "H13");
  close(r.pouchesPerKg, 150.1439279693514, "E23");
  close(r.finalPerPouch, 1.9741491458493114, "E37");
});

test("wastage convention is the block's own: 0.1 × H and 10 × H / 100 both mean 10%", () => {
  const base = EXCEL_REFERENCE_JOBS.job6.input;
  const asFraction = computeExcelJob(base);
  const asPercent = computeExcelJob({ ...base, wastage: 10, wastageConvention: "percent" });
  close(asPercent.costPerKg, asFraction.costPerKg, "same 10% either way");
});

test("Excel mode uses the Excel densities, not the product library", () => {
  const r = computeExcelJob(EXCEL_REFERENCE_JOBS.job1.input);
  close(r.filmGsm[0], 16.92, "PET 12 µm × 1.41");
  assert.notEqual(r.filmGsm[0], 16.8);
});
