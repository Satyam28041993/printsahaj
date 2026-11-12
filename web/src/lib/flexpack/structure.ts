/**
 * Tool 1 — Structure / GSM / Yield (product path).
 *
 *   layer_GSM       = micron × density            (or a measured GSM override)
 *                     paper: mill GSM, never density
 *                     MET:   base film GSM + metal add-on GSM
 *   total_GSM       = Σ film GSM + Σ dry adhesive GSM + dry ink GSM
 *   yield_m2_per_kg = 1000 / total_GSM
 *   cost_per_m2     = Σ (line GSM / 1000 × that line's ₹/kg)
 *   cost_per_kg     = cost_per_m2 / (total_GSM / 1000)
 *
 * Only DRY coating mass is in the laminate. Wet adhesive never enters GSM.
 */

import { getMaterial, type AdhesiveType } from "./materials";

export interface StructureLayer {
  materialId: string;
  /** Microns for film and foil. Ignored for paper. */
  micron: number;
  /** g/cm³. Ignored for paper and when `measuredGsm` is set. */
  density: number;
  /** Paper: the mill GSM. Film: an optional weighed/TDS GSM that replaces micron × density. */
  measuredGsm?: number | null;
  /** Metallised film only: aluminium deposit in GSM, added to the base film. */
  metalAddOnGsm?: number;
  /** ₹ per kg of this film. */
  ratePerKg: number;
}

export interface StructureBond {
  type: AdhesiveType;
  /** Dry GSM that stays in the laminate. */
  dryGsm: number;
  /** ₹ per DRY kg. */
  ratePerKgDry: number;
}

export interface StructureInk {
  /** Average dry ink GSM over the whole web (0 for unprinted). */
  dryGsm: number;
  /** ₹ per DRY kg. */
  ratePerKgDry: number;
}

export interface StructureInput {
  layers: StructureLayer[];
  /** One bond between every two films: layers.length − 1 entries are used. */
  bonds: StructureBond[];
  ink: StructureInk;
}

export interface StructureLine {
  kind: "film" | "adhesive" | "ink";
  label: string;
  gsm: number;
  ratePerKg: number;
  /** ₹ per m² of laminate contributed by this line. */
  costPerM2: number;
}

export interface StructureResult {
  lines: StructureLine[];
  filmGsm: number;
  adhesiveGsm: number;
  inkGsm: number;
  totalGsm: number;
  /** m² per kg of laminate. 0 when there is no laminate. */
  yieldM2PerKg: number;
  costPerM2: number;
  costPerKg: number;
  bondCount: number;
}

const nonNeg = (value: number | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;

/** GSM of one layer. Paper is never density-based. */
export function layerGsm(layer: StructureLayer): number {
  const material = getMaterial(layer.materialId);
  if (material.kind === "paper") return nonNeg(layer.measuredGsm);
  const measured = nonNeg(layer.measuredGsm);
  const base = measured > 0 ? measured : nonNeg(layer.micron) * nonNeg(layer.density);
  // A measured GSM of a metallised film already includes the metal.
  const metal = material.metallised && measured === 0 ? nonNeg(layer.metalAddOnGsm) : 0;
  return base + metal;
}

/** Bonds a laminate needs: 2-layer → 1, 3-layer → 2, 4-layer → 3. */
export function bondCountFor(layerCount: number): number {
  return Math.max(0, layerCount - 1);
}

export function computeStructure(input: StructureInput): StructureResult {
  const lines: StructureLine[] = [];
  const bondCount = bondCountFor(input.layers.length);

  input.layers.forEach((layer, index) => {
    const gsm = layerGsm(layer);
    const rate = nonNeg(layer.ratePerKg);
    lines.push({
      kind: "film",
      label: getMaterial(layer.materialId).label,
      gsm,
      ratePerKg: rate,
      costPerM2: (gsm / 1000) * rate,
    });
    if (index < bondCount) {
      const bond = input.bonds[index];
      const bondGsm = nonNeg(bond?.dryGsm);
      const bondRate = nonNeg(bond?.ratePerKgDry);
      lines.push({
        kind: "adhesive",
        label: `Adhesive (bond ${index + 1}, dry)`,
        gsm: bondGsm,
        ratePerKg: bondRate,
        costPerM2: (bondGsm / 1000) * bondRate,
      });
    }
  });

  const inkGsm = nonNeg(input.ink.dryGsm);
  const inkRate = nonNeg(input.ink.ratePerKgDry);
  lines.push({
    kind: "ink",
    label: "Ink (dry)",
    gsm: inkGsm,
    ratePerKg: inkRate,
    costPerM2: (inkGsm / 1000) * inkRate,
  });

  const sum = (kind: StructureLine["kind"]) =>
    lines.filter((l) => l.kind === kind).reduce((total, l) => total + l.gsm, 0);
  const filmGsm = sum("film");
  const adhesiveGsm = sum("adhesive");
  const totalGsm = filmGsm + adhesiveGsm + inkGsm;
  const costPerM2 = lines.reduce((total, l) => total + l.costPerM2, 0);

  return {
    lines,
    filmGsm,
    adhesiveGsm,
    inkGsm,
    totalGsm,
    yieldM2PerKg: totalGsm > 0 ? 1000 / totalGsm : 0,
    costPerM2,
    costPerKg: totalGsm > 0 ? costPerM2 / (totalGsm / 1000) : 0,
    bondCount,
  };
}

/** Films that are in the laminate (GSM > 0) but have no ₹/kg — the cost would silently be too low. */
export function filmsMissingRate(result: StructureResult): string[] {
  return result.lines.filter((line) => line.kind === "film" && line.gsm > 0 && line.ratePerKg === 0).map((line) => line.label);
}
