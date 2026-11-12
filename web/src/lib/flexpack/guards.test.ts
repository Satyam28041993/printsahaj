/**
 * Tests C — formula guards. Each one pins a mistake the brief says must never
 * ship (single-panel 3SS, folded gusset, density-based paper, wet adhesive in
 * GSM, …).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  backSealAllowanceFor,
  centerSealAreaM2,
  computePouchGeometry,
  outerFromInside,
  sideGussetAreaM2,
  standUpAreaM2,
  threeSideSealAreaM2,
  unfoldedGusset,
} from "./pouch";
import { bondCountFor, computeStructure, layerGsm } from "./structure";
import { checkRepeat, kanodiaRateFor, spreadTooling, toolingCost } from "./cylinder";
import { adhesiveConsumption, coatingConsumption, excelShortcutVsMassBalance, inkConsumption, wetFromDry } from "./inkAdhesive";
import { combinedWastePercent, inputMetresForStage } from "./waste";
import { DEFAULT_RATE_BOOK, defaultMetaFor, parseRateBook, serializeRateBook, setRate, tagFor } from "./rateBook";
import { MATERIALS } from "./materials";

const near = (actual: number, expected: number, tolerance = 1e-9): void => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `got ${actual}, expected ${expected}`);
};

test("3-side seal area is TWO panels", () => {
  near(threeSideSealAreaM2(250, 70), 0.035);
  assert.notEqual(threeSideSealAreaM2(250, 70), (250 * 70) / 1_000_000);
});

test("stand-up G is the full unfolded gusset (40+40 folded → 80)", () => {
  assert.equal(unfoldedGusset(40), 80);
  near(standUpAreaM2(160, 240, 80), 0.0896);
  // RollSpec's own worked example: 150 × 220, 35+35 folded → 0.0765 m².
  near(standUpAreaM2(150, 220, unfoldedGusset(35)), 0.0765);
  assert.ok(standUpAreaM2(160, 240, 40) < standUpAreaM2(160, 240, 80), "folded G under-counts");
});

test("center-seal: web = 2 × face + back seal + edge trim; area = web × repeat", () => {
  near(centerSealAreaM2(100, 150, 20), ((2 * 100 + 20) * 150) / 1_000_000);
  const g = computePouchGeometry({
    type: "center-seal",
    width: 100,
    height: 150,
    backSealAllowance: 20,
    edgeTrimPerSide: 5,
  });
  assert.equal(g.slitWidthMm, 230);
  assert.equal(g.repeatMm, 150);
  near(g.purchasedAreaM2, (230 * 150) / 1_000_000);
  assert.equal(backSealAllowanceFor("fin", 10), 20);
  assert.equal(backSealAllowanceFor("lap", 10), 10);
});

test("3SS orientation: Excel default is width across; height across swaps slit and repeat", () => {
  const base = { type: "three-side-seal" as const, width: 250, height: 70, edgeTrimPerSide: 0 };
  const excel = computePouchGeometry(base);
  assert.equal(excel.slitWidthMm, 500, "Job 1 of the workbook: slit 500 = 2 × 250");
  assert.equal(excel.repeatMm, 70);
  assert.deepEqual(computePouchGeometry({ ...base, threeSideSealAcross: "width" }), excel);
  const turned = computePouchGeometry({ ...base, threeSideSealAcross: "height" });
  assert.equal(turned.slitWidthMm, 140);
  assert.equal(turned.repeatMm, 250);
  near(turned.pouchAreaM2, excel.pouchAreaM2);
  // With trim the two orientations buy different film.
  const trimmed = computePouchGeometry({ ...base, edgeTrimPerSide: 10, threeSideSealAcross: "height" });
  near(trimmed.purchasedAreaM2, (160 * 250) / 1_000_000);
});

test("side-gusset planning model: gussets add to the width perimeter", () => {
  // RollSpec: 150 wide, 220 high, 70 mm gussets → perimeter 300 + 140.
  near(sideGussetAreaM2(150, 220, 70), (220 * 440) / 1_000_000);
});

test("lanes: trim is per master web, not per lane", () => {
  // RollSpec: two 570 mm lanes + 10 mm each side = 1,160 mm master.
  const g = computePouchGeometry({
    type: "stand-up",
    width: 160,
    height: 245,
    gusset: 80,
    edgeTrimPerSide: 10,
    lanes: 2,
  });
  assert.equal(g.webPerLaneMm, 570);
  assert.equal(g.slitWidthMm, 1160);
  near(g.purchasedAreaM2, (1160 * 160) / 2 / 1_000_000);
});

test("inside sizes get seals added once", () => {
  assert.deepEqual(
    outerFromInside({ type: "three-side-seal", insideWidth: 100, insideHeight: 150, sealWidth: 8 }),
    { width: 116, height: 158 },
  );
  assert.deepEqual(
    outerFromInside({ type: "three-side-seal", insideWidth: 100, insideHeight: 150, sealWidth: 8, topSealed: true }),
    { width: 116, height: 166 },
  );
});

test("paper is mill GSM, never density-based", () => {
  const paper = { materialId: "paper", micron: 80, density: 1.2, measuredGsm: 50, ratePerKg: 0 };
  assert.equal(layerGsm(paper), 50);
  assert.equal(layerGsm({ ...paper, measuredGsm: null }), 0, "no GSM typed → 0, not micron × density");
  assert.equal(MATERIALS.find((m) => m.id === "paper")?.density, null);
});

test("film GSM = micron × density; measured GSM overrides; MET adds metal once", () => {
  near(layerGsm({ materialId: "pet", micron: 12, density: 1.4, ratePerKg: 0 }), 16.8);
  near(layerGsm({ materialId: "alu", micron: 9, density: 2.7, ratePerKg: 0 }), 24.3);
  near(layerGsm({ materialId: "bopa", micron: 15, density: 1.15, ratePerKg: 0 }), 17.25);
  near(layerGsm({ materialId: "met-pet", micron: 12, density: 1.4, metalAddOnGsm: 0.8, ratePerKg: 0 }), 17.6);
  assert.equal(layerGsm({ materialId: "pet", micron: 12, density: 1.4, measuredGsm: 17.1, ratePerKg: 0 }), 17.1);
  assert.equal(
    layerGsm({ materialId: "met-pet", micron: 12, density: 1.4, measuredGsm: 17.5, metalAddOnGsm: 0.8, ratePerKg: 0 }),
    17.5,
    "a measured GSM already includes the metal",
  );
  near(layerGsm({ materialId: "pet", micron: 12, density: 1.4, metalAddOnGsm: 0.8, ratePerKg: 0 }), 16.8);
});

test("bonds: 2-layer 1, 3-layer 2, 4-layer 3 — extra bond rows are ignored", () => {
  assert.equal(bondCountFor(1), 0);
  assert.equal(bondCountFor(2), 1);
  assert.equal(bondCountFor(3), 2);
  assert.equal(bondCountFor(4), 3);
  const bond = { type: "solvent-based" as const, dryGsm: 2.5, ratePerKgDry: 0 };
  const s = computeStructure({
    layers: [
      { materialId: "pet", micron: 12, density: 1.4, ratePerKg: 0 },
      { materialId: "ldpe", micron: 40, density: 0.922, ratePerKg: 0 },
    ],
    bonds: [bond, bond, bond],
    ink: { dryGsm: 0, ratePerKgDry: 0 },
  });
  near(s.adhesiveGsm, 2.5);
});

test("wet adhesive is never added into GSM", () => {
  const layers = [
    { materialId: "pet", micron: 12, density: 1.4, ratePerKg: 0 },
    { materialId: "ldpe", micron: 40, density: 0.922, ratePerKg: 0 },
  ];
  const s = computeStructure({
    layers,
    bonds: [{ type: "solvent-based", dryGsm: 2.5, ratePerKgDry: 0 }],
    ink: { dryGsm: 0, ratePerKgDry: 0 },
  });
  near(s.totalGsm, 16.8 + 36.88 + 2.5);
  // 2.5 dry at 30% solids is 8.33 wet on the roller — none of that extra is in the laminate.
  near(wetFromDry(2.5, 30), 8.333333333333334);
  assert.ok(s.totalGsm < 16.8 + 36.88 + wetFromDry(2.5, 30));
});

test("cost per kg is the GSM-weighted average, coatings included", () => {
  const s = computeStructure({
    layers: [{ materialId: "pet", micron: 10, density: 1.4, ratePerKg: 100 }],
    bonds: [],
    ink: { dryGsm: 2, ratePerKgDry: 500 },
  });
  near(s.costPerM2, 0.014 * 100 + 0.002 * 500);
  near(s.costPerKg, (0.014 * 100 + 0.002 * 500) / 0.016);
  near(s.yieldM2PerKg, 62.5);
});

test("ink and adhesive: dry kg = area × coverage × GSM ÷ 1000; wet = dry ÷ solids", () => {
  const ink = coatingConsumption({
    areaM2: 10_000,
    coveragePercent: 50,
    dryGsm: 1.5,
    solidsPercent: 25,
    ratePerKg: 400,
    rateBasis: "wet",
  });
  near(ink.dryKg, 7.5);
  near(ink.wetKg, 30);
  near(ink.volatileKg, 22.5);
  near(ink.cost, 12_000);
  near(ink.averageDryGsm, 0.75);

  const solventless = adhesiveConsumption({
    areaM2: 10_000,
    bonds: 2,
    dryGsmPerBond: 1.8,
    solidsPercent: 100,
    ratePerKg: 300,
    rateBasis: "dry",
  });
  near(solventless.dryKg, 36);
  assert.equal(solventless.wetKg, solventless.dryKg, "solventless: wet = dry");

  const job = inkConsumption({
    areaM2: 1000,
    colours: [
      { name: "C", coveragePercent: 40, dryGsm: 1.5, ratePerKg: 0 },
      { name: "White", coveragePercent: 100, dryGsm: 2, ratePerKg: 0 },
    ],
    solidsPercent: 100,
    rateBasis: "dry",
  });
  near(job.averageDryGsm, 0.6 + 2);
  near(job.dryKg, 2.6);
});

test("the Excel ink shortcut overstates a mass balance by the first film's GSM", () => {
  const gap = excelShortcutVsMassBalance(2, 75, 16.92);
  near(gap.excel, 150);
  near(gap.massBalance, (2 / 16.92) * 75);
  near(gap.overstatementFactor, 16.92);
});

test("cylinder: length × circumference × rate × colours, Kanodia tiers", () => {
  assert.equal(kanodiaRateFor(640), 2.1);
  assert.equal(kanodiaRateFor(749.9), 2.1);
  assert.equal(kanodiaRateFor(800), 2.3);
  const t = toolingCost({ faceLengthMm: 600, circumferenceMm: 640, ratePerCm2: 2.1, colours: 6 });
  assert.equal(t.areaCm2, 3840);
  near(t.total, 48_384, 1e-6);
  near(spreadTooling(48_384, 50_000).perPieceFirstOrder, 0.96768);
  near(spreadTooling(48_384, 50_000, 200_000).perPieceOverLife, 0.24192);
});

test("circumference must be a whole multiple of the repeat", () => {
  assert.deepEqual(checkRepeat(640, 160), { upsAround: 4, isWholeMultiple: true, nearestCircumferenceMm: 640 });
  const off = checkRepeat(650, 160);
  assert.equal(off.isWholeMultiple, false);
  assert.equal(off.nearestCircumferenceMm, 640);
});

test("waste: input = output ÷ (1 − waste), not output × (1 + waste)", () => {
  near(inputMetresForStage(960, 4), 1000);
  assert.notEqual(inputMetresForStage(960, 4), 960 * 1.04);
  near(inputMetresForStage(960, 4, 50), 1050);
  near(combinedWastePercent([
    { id: "a", label: "a", runWastePercent: 3, setupMetres: 0 },
    { id: "b", label: "b", runWastePercent: 4, setupMetres: 0 },
  ]), (1 - 0.97 * 0.96) * 100);
});

test("rate book: example money is tagged Example until the owner types over it", () => {
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "filmRates.pet"), "example");
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "conversion.printing.ratePerKg"), "example");
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "zipperPerPiece"), "example");
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "profitPercent"), "example");
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "gravureRateBelow"), "sourced");
  assert.equal(tagFor(DEFAULT_RATE_BOOK, "filmRates.bopp"), "blank", "no invented film prices");
  assert.equal(DEFAULT_RATE_BOOK.filmRates.bopp, undefined);
  assert.match(defaultMetaFor("gravureRateBelow").note, /Kanodia.*12 Nov 2026/);

  const edited = setRate(DEFAULT_RATE_BOOK, "filmRates.pet", 152);
  assert.equal(edited.filmRates.pet, 152);
  assert.equal(tagFor(edited, "filmRates.pet"), "owner");
  assert.equal(DEFAULT_RATE_BOOK.filmRates.pet, 145, "defaults are not mutated");
});

test("rate book: survives a storage round trip and ignores damaged data", () => {
  const edited = setRate(setRate(DEFAULT_RATE_BOOK, "conversion.pouching.ratePer1000", 120), "filmRates.bopp", 160);
  const back = parseRateBook(serializeRateBook(edited));
  assert.equal(back.conversion.pouching.ratePer1000, 120);
  assert.equal(back.filmRates.bopp, 160);
  assert.deepEqual(back.touched, edited.touched);

  assert.deepEqual(parseRateBook("not json"), parseRateBook(null));
  const damaged = parseRateBook(JSON.stringify({ version: 1, gstPercent: "abc", profitPercent: -4 }));
  assert.equal(damaged.gstPercent, 18);
  assert.equal(damaged.profitPercent, 15);
});
