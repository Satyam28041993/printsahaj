/**
 * Label Rate & Matrix Costing — the one formula behind the /calculators tab, the
 * homepage LiveTool and the homepage showcase. Change it here and all three move.
 *
 * Roll-label costing: paper area for 1,000 labels (label size plus the gaps
 * between them) × the ₹/sqm paper rate × wastage, plus ink and varnish per 1,000.
 */

export interface LabelRateInput {
  /** mm */
  labelW: number;
  /** mm */
  labelH: number;
  /** Gap between labels around the web, mm */
  gapAround: number;
  /** Gap between labels across the web, mm */
  gapAcross: number;
  /** ₹ per sqm */
  paperRate: number;
  /** ₹ per 1,000 labels */
  inkCostPer1k: number;
  /** ₹ per 1,000 labels */
  varnishCostPer1k: number;
  /** % */
  wastagePercent: number;
}

/** The calculator's own defaults. */
export const LABEL_RATE_DEFAULTS: LabelRateInput = {
  labelW: 114,
  labelH: 76,
  gapAround: 3,
  gapAcross: 3,
  paperRate: 48,
  inkCostPer1k: 35,
  varnishCostPer1k: 15,
  wastagePercent: 12,
};

export function labelAreaPer1kSqm(input: Pick<LabelRateInput, "labelW" | "labelH" | "gapAround" | "gapAcross">): number {
  return ((input.labelW + input.gapAcross) * (input.labelH + input.gapAround) * 1000) / 1_000_000;
}

/** Total ₹ per 1,000 labels. */
export function labelRatePerThousand(input: LabelRateInput): number {
  const paperCost1k = labelAreaPer1kSqm(input) * input.paperRate * (1 + input.wastagePercent / 100);
  return paperCost1k + input.inkCostPer1k + input.varnishCostPer1k;
}
