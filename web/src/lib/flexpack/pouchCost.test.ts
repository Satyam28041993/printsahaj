/**
 * Golden test B — the product path must reproduce the researched stand-up
 * worked example (docs/flexible-packaging-calculators/01-research.md §8).
 *
 * The research rounds mid-way (515.00 kg, ₹157.29/kg), so its rupee totals sit
 * ₹2–3 above the unrounded arithmetic. The engine does not round mid-way; the
 * tests pin the research's own steps and allow only that rounding gap.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { computePouchCost, computeSlabs } from "./pouchCost";
import { WORKED_EXAMPLE } from "./workedExample";

const near = (actual: number, expected: number, tolerance: number, label: string): void => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: got ${actual}, expected ${expected} ± ${tolerance}`);
};

const r = computePouchCost(WORKED_EXAMPLE);

test("Step 1 — laminate GSM 105.44, yield 9.484 m²/kg", () => {
  const gsm = r.structure.lines.map((line) => Number(line.gsm.toFixed(2)));
  assert.deepEqual(gsm, [16.8, 2.5, 17.6, 2.5, 64.54, 1.5]);
  near(r.structure.totalGsm, 105.44, 1e-9, "total GSM");
  assert.equal(Number(r.structure.yieldM2PerKg.toFixed(3)), 9.484);
});

test("Step 2 — area 0.0896 m², slit 580, repeat 160, 489.24 kg good film", () => {
  near(r.geometry.pouchAreaM2, 0.0896, 1e-12, "pouch area");
  assert.equal(r.geometry.webPerLaneMm, 560);
  assert.equal(r.geometry.slitWidthMm, 580);
  assert.equal(r.geometry.repeatMm, 160);
  near(r.geometry.purchasedAreaM2, 0.0928, 1e-12, "purchased area");
  near(r.filmGramsPerPouch, 9.4474, 5e-5, "film grams");
  near(r.pouchesPerKgFilm, 105.85, 5e-3, "pouches/kg");
  near(r.goodKg, 489.24, 5e-3, "good kg incl. trim");
  near(r.geometry.trimShare * 100, 3.45, 5e-3, "layout trim share");
});

test("Step 3 — 5% process waste on input: 515.00 kg, about 4,884 m²", () => {
  near(r.inputKg, 515.0, 0.01, "input kg");
  near(r.inputAreaM2, 4884, 0.5, "input area");
});

test("Step 4 — material ₹16.5845/m² (₹157.29/kg) and the cost lines", () => {
  near(r.structure.costPerM2, 16.5845, 1e-9, "₹/m²");
  assert.equal(Number(r.structure.costPerKg.toFixed(2)), 157.29);
  near(r.material.total, 81_004, 3, "material");
  near(r.conversion.total, 39_140, 1, "conversion");
  assert.equal(r.tooling.areaCm2, 3840);
  near(r.tooling.total, 48_384, 1e-6, "cylinders 3,840 × 2.10 × 6");
  assert.equal(r.hardware.total, 45_000);
  near(r.firstOrder.factoryCost, 213_528, 3, "first-order factory cost");
  near(r.repeatOrder.factoryCost, 165_144, 3, "repeat factory cost");
});

test("Step 5 — per pouch, margin and GST as quoted", () => {
  assert.equal(r.firstOrder.perPouch.cost, 4.27);
  assert.equal(r.repeatOrder.perPouch.cost, 3.3);
  assert.equal(r.firstOrder.perPouch.costPer1000, 4271);
  assert.equal(r.repeatOrder.perPouch.costPer1000, 3303);
  assert.equal(r.firstOrder.perPouch.sellingPrice, 4.91);
  assert.equal(r.repeatOrder.perPouch.sellingPrice, 3.8);
  assert.equal(r.firstOrder.perPouch.gst, 0.88);
  assert.equal(r.repeatOrder.perPouch.gst, 0.68);
  assert.equal(r.firstOrder.perPouch.invoicePrice, 5.79);
  assert.equal(r.repeatOrder.perPouch.invoicePrice, 4.48);
  assert.equal(Number(r.toolingPerPouch.toFixed(2)), 0.97);
});

test("first vs repeat differ by tooling, and by nothing else", () => {
  near(r.firstOrder.factoryCost - r.repeatOrder.factoryCost, r.tooling.total, 1e-6, "difference");
  const noTooling = computePouchCost({ ...WORKED_EXAMPLE, tooling: null });
  near(noTooling.firstOrder.factoryCost, noTooling.repeatOrder.factoryCost, 1e-9, "unprinted job");
  near(noTooling.firstOrder.factoryCost, r.repeatOrder.factoryCost, 1e-6, "repeat = no tooling");
});

test("GST is separate: it never changes the ex-GST selling price", () => {
  const noGst = computePouchCost({ ...WORKED_EXAMPLE, gstPercent: 0 });
  assert.equal(noGst.firstOrder.sellingPrice, r.firstOrder.sellingPrice);
  assert.equal(noGst.firstOrder.gst, 0);
  near(r.firstOrder.gst, r.firstOrder.sellingPrice * 0.18, 1e-6, "18% of selling price");
});

test("packing % then profit % apply to the running total, in that order", () => {
  const packed = computePouchCost({ ...WORKED_EXAMPLE, packingPercent: 2 });
  near(packed.firstOrder.packing, packed.firstOrder.factoryCost * 0.02, 1e-6, "packing");
  near(packed.firstOrder.profit, (packed.firstOrder.factoryCost + packed.firstOrder.packing) * 0.15, 1e-6, "profit");
});

test("layout trim is purchased film, not folded into the waste percent", () => {
  const noWaste = computePouchCost({ ...WORKED_EXAMPLE, waste: { mode: "simple", combinedPercent: 0 } });
  near(noWaste.inputKg, noWaste.goodKg, 1e-9, "0% waste → input = good film incl. trim");
  assert.ok(noWaste.goodKg > noWaste.netKg, "trim is still bought at 0% waste");
  near(noWaste.material.processWaste, 0, 1e-6, "no process-waste rupees");
});

test("stage-wise waste compounds from the last machine backwards", () => {
  const staged = computePouchCost({
    ...WORKED_EXAMPLE,
    waste: {
      mode: "stages",
      stages: [
        { id: "printing", label: "Printing", runWastePercent: 3, setupMetres: 800 },
        { id: "lamination", label: "Lamination", runWastePercent: 2, setupMetres: 400 },
        { id: "slitting", label: "Slitting", runWastePercent: 1, setupMetres: 100 },
        { id: "pouching", label: "Pouching", runWastePercent: 4, setupMetres: 0 },
      ],
    },
  });
  // 8,000 m good → pouch ÷0.96 → slit ÷0.99 + 100 → lam ÷0.98 + 400 → print ÷0.97 + 800
  const expected = ((8000 / 0.96 / 0.99 + 100) / 0.98 + 400) / 0.97 + 800;
  near(staged.goodMetres, 8000, 1e-9, "good metres");
  near(staged.inputMetres, expected, 1e-6, "input metres");
});

test("slabs: a smaller first order carries more cylinder per pouch; repeat barely moves", () => {
  const slabs = computeSlabs(WORKED_EXAMPLE, [10_000, 25_000, 50_000, 100_000]);
  assert.equal(slabs.length, 4);
  for (let i = 1; i < slabs.length; i += 1) {
    assert.ok(slabs[i].first.cost < slabs[i - 1].first.cost);
  }
  assert.equal(slabs[2].first.cost, 4.27);
  assert.equal(slabs[0].repeat.cost, slabs[3].repeat.cost);
});
