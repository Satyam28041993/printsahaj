/**
 * Tool 3 — Cylinder / plate cost and its spread over an order.
 *
 *   tooling ₹ = face length (cm) × circumference (cm) × ₹/cm² × colours
 *
 * A fixed job cost: charged on the first order, off on a repeat with the same
 * cylinders.
 */

export type PrintProcess = "gravure" | "flexo";

/** Kanodia Gravure (Delhi) published estimator rates, retrieved 12 Nov 2026. */
export const KANODIA_CYLINDER = {
  rateBelow: 2.1,
  rateAbove: 2.3,
  thresholdCircumferenceMm: 750,
  source: "Kanodia Gravure, Delhi — cylinder price estimator",
  url: "https://kanodiagravure.com/cylinder-costs/",
  retrieved: "12 Nov 2026",
} as const;

/** Alliance Printech flexo-vs-gravure tool pre-fill. An example input, not a market survey. */
export const ALLIANCE_FLEXO_PLATE = {
  rate: 1.5,
  source: "Alliance Printech, Faridabad — flexo vs gravure tool default",
  url: "https://allianceprintech.com/resources/flexo-vs-gravure/",
  retrieved: "12 Nov 2026",
} as const;

const pos = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

/**
 * Kanodia's two-tier rate. Kanodia states "below 750 mm" and "above 750 mm";
 * exactly 750 mm is not defined on their page, so it is treated as the lower tier.
 */
export function kanodiaRateFor(
  circumferenceMm: number,
  rates: { rateBelow: number; rateAbove: number; thresholdCircumferenceMm: number } = KANODIA_CYLINDER,
): number {
  return pos(circumferenceMm) > rates.thresholdCircumferenceMm ? rates.rateAbove : rates.rateBelow;
}

export interface ToolingInput {
  /** Cylinder face length / plate width, mm. */
  faceLengthMm: number;
  /** Cylinder circumference / plate repeat length, mm. */
  circumferenceMm: number;
  ratePerCm2: number;
  colours: number;
}

export interface ToolingResult {
  /** cm² of one cylinder / plate. */
  areaCm2: number;
  costPerColour: number;
  total: number;
}

export function toolingCost(input: ToolingInput): ToolingResult {
  const areaCm2 = (pos(input.faceLengthMm) / 10) * (pos(input.circumferenceMm) / 10);
  const costPerColour = areaCm2 * pos(input.ratePerCm2);
  return { areaCm2, costPerColour, total: costPerColour * Math.floor(pos(input.colours)) };
}

export interface ToolingSpread {
  /** ₹ per piece carried by the FIRST order. Repeat orders carry 0. */
  perPieceFirstOrder: number;
  /** ₹ per piece if the same tooling is recovered over first + expected repeat orders. */
  perPieceOverLife: number;
}

export function spreadTooling(total: number, firstOrderQty: number, lifetimeQty?: number): ToolingSpread {
  const first = pos(firstOrderQty);
  const life = Math.max(first, pos(lifetimeQty ?? 0));
  return {
    perPieceFirstOrder: first > 0 ? pos(total) / first : 0,
    perPieceOverLife: life > 0 ? pos(total) / life : 0,
  };
}

export interface RepeatCheck {
  /** Repeats around the cylinder, to the nearest whole number. */
  upsAround: number;
  isWholeMultiple: boolean;
  /** Circumference that WOULD fit `upsAround` repeats exactly, mm. */
  nearestCircumferenceMm: number;
}

/** A gravure cylinder circumference must be a whole multiple of the print repeat. */
export function checkRepeat(circumferenceMm: number, repeatMm: number, toleranceMm = 0.01): RepeatCheck {
  const circumference = pos(circumferenceMm);
  const repeat = pos(repeatMm);
  if (circumference === 0 || repeat === 0) {
    return { upsAround: 0, isWholeMultiple: false, nearestCircumferenceMm: 0 };
  }
  const upsAround = Math.max(1, Math.round(circumference / repeat));
  const nearestCircumferenceMm = upsAround * repeat;
  return {
    upsAround,
    isWholeMultiple: Math.abs(nearestCircumferenceMm - circumference) <= toleranceMm,
    nearestCircumferenceMm,
  };
}
