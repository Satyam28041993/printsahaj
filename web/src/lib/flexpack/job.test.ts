/**
 * The shared job → engine input. Regression tests for the three review
 * findings (plain jobs, film-to-buy build-up, the structure tool's ink) and
 * for reading a damaged job back out of storage.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_JOB, costInputFor, parseJob, sanitizeJob, stagesFor, structureInputFor, type JobState } from "./job";
import { computePouchCost } from "./pouchCost";
import { computeStructure } from "./structure";
import { DEFAULT_RATE_BOOK } from "./rateBook";
import { WORKED_EXAMPLE } from "./workedExample";

const book = DEFAULT_RATE_BOOK;
const near = (actual: number, expected: number, tolerance = 1e-9): void => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `got ${actual}, expected ${expected}`);
};

test("the default job with the default rate book IS the worked example", () => {
  const fromJob = computePouchCost(costInputFor(DEFAULT_JOB, book));
  const golden = computePouchCost(WORKED_EXAMPLE);
  near(fromJob.structure.totalGsm, golden.structure.totalGsm);
  near(fromJob.firstOrder.factoryCost, golden.firstOrder.factoryCost, 1e-6);
  near(fromJob.repeatOrder.factoryCost, golden.repeatOrder.factoryCost, 1e-6);
  near(fromJob.firstOrder.invoiceTotal, golden.firstOrder.invoiceTotal, 1e-6);
});

test("(i) a plain job drops printing conversion, ink GSM and cylinders", () => {
  const plain: JobState = { ...DEFAULT_JOB, printed: false };
  const input = costInputFor(plain, book);

  assert.deepEqual(stagesFor(plain), ["lamination", "slitting", "pouching"]);
  assert.deepEqual(input.conversion.map((line) => line.id), ["lamination", "slitting", "pouching"]);
  assert.equal(input.tooling, null);
  assert.equal(input.structure.ink.dryGsm, 0);

  const printed = computePouchCost(costInputFor(DEFAULT_JOB, book));
  const result = computePouchCost(input);
  near(result.structure.totalGsm, printed.structure.totalGsm - DEFAULT_JOB.inkDryGsm);
  assert.equal(result.structure.inkGsm, 0);
  assert.equal(result.tooling.total, 0);
  assert.equal(result.conversion.lines.some((line) => line.id === "printing"), false);
  // ₹48/kg of conversion is left (18 + 8 + 22), on the plain job's own input kg.
  near(result.conversion.total, result.inputKg * 48, 1e-6);
  near(result.firstOrder.factoryCost, result.repeatOrder.factoryCost, 1e-9);
});

test("(i) a plain job drops the print waste stage and the print setup metres", () => {
  const staged: JobState = { ...DEFAULT_JOB, advanced: true, wasteMode: "stages" };
  const printedInput = costInputFor(staged, book);
  const plainInput = costInputFor({ ...staged, printed: false }, book);

  assert.equal(printedInput.waste.mode, "stages");
  assert.equal(plainInput.waste.mode, "stages");
  if (printedInput.waste.mode !== "stages" || plainInput.waste.mode !== "stages") return;
  assert.deepEqual(printedInput.waste.stages.map((s) => s.id), ["printing", "lamination", "slitting", "pouching"]);
  assert.deepEqual(plainInput.waste.stages.map((s) => s.id), ["lamination", "slitting", "pouching"]);

  // 8,000 m good → pouch ÷0.96 → slit ÷0.99 + 100 → lam ÷0.98 + 400, and nothing for the press.
  const lamIn = (8000 / 0.96 / 0.99 + 100) / 0.98 + 400;
  const plain = computePouchCost(plainInput);
  const printed = computePouchCost(printedInput);
  near(plain.inputMetres, lamIn, 1e-6);
  near(printed.inputMetres, lamIn / 0.97 + 800, 1e-6);
});

test("(ii) film-to-buy lines add up for printed and plain jobs, simple and stage-wise", () => {
  const variants: JobState[] = [
    DEFAULT_JOB,
    { ...DEFAULT_JOB, printed: false },
    { ...DEFAULT_JOB, advanced: true, wasteMode: "stages" },
    { ...DEFAULT_JOB, advanced: true, wasteMode: "stages", printed: false, lanes: 2, repeatGap: 3 },
    { ...DEFAULT_JOB, pouchType: "three-side-seal", width: 250, height: 70 },
    { ...DEFAULT_JOB, pouchType: "center-seal", width: 100, height: 150 },
  ];
  for (const job of variants) {
    const r = computePouchCost(costInputFor(job, book));
    near(r.netKg + r.trimKg + r.processWasteKg, r.inputKg, 1e-9);
    assert.ok(r.trimKg >= 0 && r.processWasteKg >= 0);
    assert.ok(r.trimKg < r.netKg, "trim is an increment, not the running total");
  }
});

test("(iii) the structure tool still counts ink when the cost job is unprinted", () => {
  const plain: JobState = { ...DEFAULT_JOB, printed: false };
  const structureTool = computeStructure(structureInputFor(plain, book));
  near(structureTool.inkGsm, 1.5);
  near(structureTool.totalGsm, 105.44);

  const costPath = computeStructure(costInputFor(plain, book).structure);
  assert.equal(costPath.inkGsm, 0);
  near(costPath.totalGsm, 103.94);
});

test("Simple mode ignores Advanced-only fields", () => {
  const input = costInputFor({ ...DEFAULT_JOB, advanced: false, lanes: 3, repeatGap: 5, wasteMode: "stages", simpleSetupMetres: 500, threeSideSealAcross: "height" }, book);
  assert.equal(input.geometry.lanes, 1);
  assert.equal(input.geometry.repeatGap, 0);
  assert.equal(input.geometry.threeSideSealAcross, "width");
  assert.deepEqual(input.waste, { mode: "simple", combinedPercent: 5, setupMetres: 0 });
});

test("stored job: a clean round trip is unchanged", () => {
  const job: JobState = { ...DEFAULT_JOB, advanced: true, pouchType: "three-side-seal", width: 250, quantity: 12_000, zipper: false };
  assert.deepEqual(parseJob(JSON.stringify(job)), job);
});

test("stored job: bad fields fall back one by one, good ones are kept", () => {
  const stored = {
    ...DEFAULT_JOB,
    width: "abc",
    height: -40,
    gusset: 95,
    quantity: Number.NaN,
    lanes: 0,
    colours: 999,
    printed: "yes",
    pouchType: "balloon",
    process: "flexo",
    wasteMode: 7,
    circumferenceMm: null,
  };
  const job = sanitizeJob(JSON.parse(JSON.stringify(stored)));
  assert.equal(job.width, DEFAULT_JOB.width);
  assert.equal(job.height, DEFAULT_JOB.height);
  assert.equal(job.gusset, 95, "a good value next to bad ones survives");
  assert.equal(job.quantity, DEFAULT_JOB.quantity);
  assert.equal(job.lanes, 1);
  assert.equal(job.colours, DEFAULT_JOB.colours);
  assert.equal(job.printed, true);
  assert.equal(job.pouchType, "stand-up");
  assert.equal(job.process, "flexo");
  assert.equal(job.wasteMode, "simple");
  assert.equal(job.circumferenceMm, DEFAULT_JOB.circumferenceMm);
});

test("stored job: a damaged layer list can never crash or produce NaN", () => {
  const damaged: unknown[] = [
    "nope",
    42,
    null,
    {},
    { layers: "x" },
    { version: 1 },
    { version: 1, layers: null },
    { version: 1, layers: [] },
    { version: 1, layers: [null, 5, "pet", {}, { materialId: "unobtainium", thickness: 12 }] },
    { version: 1, layers: [{ materialId: "pet", thickness: "12", density: {}, measuredGsm: "x", metalAddOnGsm: -3 }], bondDryGsm: "x" },
    { version: 1, layers: [{ materialId: "pet", uid: "a" }, { materialId: "ldpe", uid: "a" }], bondDryGsm: [null, "2", -1, 3] },
    { version: 1, layers: Array.from({ length: 40 }, () => ({ materialId: "pet", thickness: 12 })) },
    { version: 2, layers: [{ materialId: "pet" }] },
  ];
  for (const data of damaged) {
    const job = parseJob(JSON.stringify(data));
    assert.ok(job.layers.length >= 1 && job.layers.length <= 6, JSON.stringify(data));
    assert.equal(job.bondDryGsm.length, job.layers.length - 1);
    assert.equal(new Set(job.layers.map((layer) => layer.uid)).size, job.layers.length, "unique React keys");
    const result = computePouchCost(costInputFor(job, book));
    for (const value of [result.structure.totalGsm, result.inputKg, result.firstOrder.invoiceTotal, result.firstOrder.perPouch.cost]) {
      assert.ok(Number.isFinite(value), `finite result for ${JSON.stringify(data)}`);
    }
  }
  assert.equal(parseJob("{not json"), DEFAULT_JOB);
  assert.equal(parseJob(null), DEFAULT_JOB);

  const mixed = parseJob(JSON.stringify({ version: 1, layers: [{ materialId: "pet", thickness: "12", density: {} }] }));
  assert.equal(mixed.layers[0].thickness, 10, "falls back to the film's first typical micron");
  assert.equal(mixed.layers[0].density, 1.4);
});
