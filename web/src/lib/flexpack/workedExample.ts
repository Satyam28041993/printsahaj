/**
 * The researched stand-up worked example (01-research.md §8), as engine input.
 * Used by the golden test and as the calculators' opening state.
 *
 * Stand-up 160 × 240 + 80 mm (G unfolded), zipper, 50,000 pcs,
 * PET 12 / MET PET 12 / LDPE 70. Every rupee is an Example except the
 * Kanodia cylinder rate.
 */

import { kanodiaRateFor } from "./cylinder";
import type { PouchCostInput } from "./pouchCost";

export const WORKED_EXAMPLE: PouchCostInput = {
  structure: {
    layers: [
      { materialId: "pet", micron: 12, density: 1.4, ratePerKg: 145 },
      { materialId: "met-pet", micron: 12, density: 1.4, metalAddOnGsm: 0.8, ratePerKg: 185 },
      { materialId: "ldpe", micron: 70, density: 0.922, ratePerKg: 125 },
    ],
    bonds: [
      { type: "solvent-based", dryGsm: 2.5, ratePerKgDry: 400 },
      { type: "solvent-based", dryGsm: 2.5, ratePerKgDry: 400 },
    ],
    ink: { dryGsm: 1.5, ratePerKgDry: 550 },
  },
  geometry: {
    type: "stand-up",
    width: 160,
    height: 240,
    gusset: 80,
    edgeTrimPerSide: 10,
    lanes: 1,
  },
  quantity: 50_000,
  waste: { mode: "simple", combinedPercent: 5 },
  conversion: [
    { id: "printing", label: "Printing", ratePerKg: 28, ratePer1000: 0 },
    { id: "lamination", label: "Lamination", ratePerKg: 18, ratePer1000: 0 },
    { id: "slitting", label: "Slitting", ratePerKg: 8, ratePer1000: 0 },
    { id: "pouching", label: "Pouching", ratePerKg: 22, ratePer1000: 0 },
  ],
  tooling: {
    faceLengthMm: 600,
    circumferenceMm: 640,
    ratePerCm2: kanodiaRateFor(640),
    colours: 6,
  },
  hardware: [{ id: "zipper", label: "Zipper", enabled: true, ratePerPiece: 0.9 }],
  packingPercent: 0,
  profitPercent: 15,
  gstPercent: 18,
};
