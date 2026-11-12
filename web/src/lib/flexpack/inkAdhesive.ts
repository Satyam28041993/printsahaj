/**
 * Tool 4 — Ink and adhesive consumption, physically correct mass.
 *
 *   dry kg = area (m²) × coverage × dry GSM ÷ 1000
 *   wet kg = dry kg ÷ solids            (solventless: solids = 100%, wet = dry)
 *
 * Only the DRY kg stays in the laminate. The wet kg is what leaves the drum.
 * This is NOT the reference Excel's shortcut (GSM × ₹/kg) — see excelMode.ts.
 */

const pos = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

/** Solids % → fraction, clamped to (0, 1]. 0 or blank is treated as 100% (no solvent). */
export function solidsFraction(solidsPercent: number): number {
  const value = pos(solidsPercent);
  if (value === 0) return 1;
  return Math.min(100, value) / 100;
}

export function wetFromDry(dry: number, solidsPercent: number): number {
  return pos(dry) / solidsFraction(solidsPercent);
}

/** ₹/kg basis: price of the dry solids, or price of the wet product as it is bought/applied. */
export type RateBasis = "dry" | "wet";

export interface CoatingInput {
  /** m² of web that passes the coating / printing station. */
  areaM2: number;
  /** Share of that area actually covered, %. Adhesive is normally 100. */
  coveragePercent: number;
  /** Dry coat weight on the covered area, GSM. */
  dryGsm: number;
  solidsPercent: number;
  ratePerKg: number;
  rateBasis: RateBasis;
}

export interface CoatingResult {
  dryKg: number;
  wetKg: number;
  /** Solvent / water that flashes off, kg. */
  volatileKg: number;
  cost: number;
  /** Dry GSM averaged over the WHOLE area — this is what goes into laminate GSM. */
  averageDryGsm: number;
  /** Wet coat weight on the covered area, GSM. For the anilox / gravure-roll setting only. */
  wetGsm: number;
}

export function coatingConsumption(input: CoatingInput): CoatingResult {
  const coverage = Math.min(100, pos(input.coveragePercent)) / 100;
  const averageDryGsm = pos(input.dryGsm) * coverage;
  const dryKg = (pos(input.areaM2) * averageDryGsm) / 1000;
  const wetKg = wetFromDry(dryKg, input.solidsPercent);
  const billedKg = input.rateBasis === "wet" ? wetKg : dryKg;
  return {
    dryKg,
    wetKg,
    volatileKg: wetKg - dryKg,
    cost: billedKg * pos(input.ratePerKg),
    averageDryGsm,
    wetGsm: wetFromDry(pos(input.dryGsm), input.solidsPercent),
  };
}

export interface InkColour {
  name: string;
  coveragePercent: number;
  /** Dry laydown on the covered area, GSM. */
  dryGsm: number;
  ratePerKg: number;
}

export interface InkJobInput {
  areaM2: number;
  colours: InkColour[];
  solidsPercent: number;
  rateBasis: RateBasis;
}

export interface InkJobResult {
  colours: (CoatingResult & { name: string })[];
  dryKg: number;
  wetKg: number;
  cost: number;
  /** Σ coverage × laydown — the "dry ink GSM" line of the structure builder. */
  averageDryGsm: number;
}

export function inkConsumption(input: InkJobInput): InkJobResult {
  const colours = input.colours.map((colour) => ({
    name: colour.name,
    ...coatingConsumption({
      areaM2: input.areaM2,
      coveragePercent: colour.coveragePercent,
      dryGsm: colour.dryGsm,
      solidsPercent: input.solidsPercent,
      ratePerKg: colour.ratePerKg,
      rateBasis: input.rateBasis,
    }),
  }));
  const sum = (pick: (c: CoatingResult) => number) => colours.reduce((total, c) => total + pick(c), 0);
  return {
    colours,
    dryKg: sum((c) => c.dryKg),
    wetKg: sum((c) => c.wetKg),
    cost: sum((c) => c.cost),
    averageDryGsm: sum((c) => c.averageDryGsm),
  };
}

export interface AdhesiveJobInput {
  areaM2: number;
  /** Bonds in the laminate (2-layer 1, 3-layer 2, 4-layer 3). */
  bonds: number;
  dryGsmPerBond: number;
  solidsPercent: number;
  ratePerKg: number;
  rateBasis: RateBasis;
}

export function adhesiveConsumption(input: AdhesiveJobInput): CoatingResult {
  return coatingConsumption({
    areaM2: pos(input.areaM2) * Math.floor(pos(input.bonds)),
    coveragePercent: 100,
    dryGsm: input.dryGsmPerBond,
    solidsPercent: input.solidsPercent,
    ratePerKg: input.ratePerKg,
    rateBasis: input.rateBasis,
  });
}

/**
 * The reference Excel's shortcut: RATE = GSM × ₹/kg, per kg of the FIRST film.
 * Returned next to the mass-balance figure so an owner can see the gap.
 */
export function excelShortcutVsMassBalance(dryGsm: number, ratePerKg: number, firstLayerGsm: number) {
  const excel = pos(dryGsm) * pos(ratePerKg);
  const massBalance = firstLayerGsm > 0 ? (pos(dryGsm) / firstLayerGsm) * pos(ratePerKg) : 0;
  return { excel, massBalance, overstatementFactor: massBalance > 0 ? excel / massBalance : 0 };
}
