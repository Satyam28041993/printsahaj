/**
 * Tool 2 — Pouch cost (product path).
 *
 * Order of calculation (documented, do not reshuffle):
 *   1. laminate GSM and ₹/m²                       (structure.ts)
 *   2. pouch area, slit width, repeat              (pouch.ts — trim is purchased film)
 *   3. good metres → input metres                  (waste.ts — last machine first)
 *   4. material      = input m² × ₹/m²
 *      conversion    = input kg × ₹/kg  +  quantity/1000 × ₹/1000
 *      tooling       = cylinders / plates          (first order only)
 *      hardware      = zipper / spout / valve ₹ per piece × quantity
 *   5. packing %     on (material + conversion + tooling + hardware)
 *      (process waste is already inside the kg — it is not added a second time)
 *   6. profit %      on the running total
 *   7. GST %         on the selling price, always shown separately
 *
 * First order = tooling on. Repeat order = tooling off. Nothing else differs.
 */

import { computePouchGeometry, pouchFilmGrams, pouchesPerKg, type PouchGeometry, type PouchGeometryInput } from "./pouch";
import { computeStructure, type StructureInput, type StructureResult } from "./structure";
import { toolingCost, type ToolingInput, type ToolingResult } from "./cylinder";
import { inputMetresForStage, inputMetresForStages, webKg, type WasteStage } from "./waste";

export interface ConversionLine {
  id: string;
  label: string;
  /** ₹ per kg of INPUT laminate. 0 = not used. */
  ratePerKg: number;
  /** ₹ per 1,000 pouches ordered. 0 = not used. */
  ratePer1000: number;
}

export interface HardwareLine {
  id: string;
  label: string;
  enabled: boolean;
  ratePerPiece: number;
  /** Optional grams per piece, for finished-pouch weight only. */
  gramsPerPiece?: number;
}

export type WasteInput =
  | { mode: "simple"; combinedPercent: number; setupMetres?: number }
  | { mode: "stages"; stages: WasteStage[] };

export interface PouchCostInput {
  structure: StructureInput;
  geometry: PouchGeometryInput;
  quantity: number;
  waste: WasteInput;
  conversion: ConversionLine[];
  /** Cylinders or plates. `null` for an unprinted job. */
  tooling: ToolingInput | null;
  hardware: HardwareLine[];
  packingPercent: number;
  profitPercent: number;
  gstPercent: number;
}

export interface OrderCost {
  /** material + conversion + tooling + hardware */
  factoryCost: number;
  packing: number;
  /** factory cost + packing — ex-profit, ex-GST */
  costBeforeProfit: number;
  profit: number;
  /** ex-GST */
  sellingPrice: number;
  gst: number;
  invoiceTotal: number;
  perPouch: QuoteLines;
}

/**
 * Per-pouch quote lines at FULL precision. Nothing is rounded inside the
 * engine; round only when displaying (2 decimals, half-up — `roundPaisa`).
 * So a displayed selling price + displayed GST may differ from the displayed
 * invoice price by a paisa; the invoice price is the correct one.
 */
export interface QuoteLines {
  cost: number;
  costPer1000: number;
  sellingPrice: number;
  gst: number;
  invoicePrice: number;
}

export interface PouchCostResult {
  structure: StructureResult;
  geometry: PouchGeometry;
  quantity: number;

  filmGramsPerPouch: number;
  /** Film + enabled hardware grams. Equals film grams when no hardware weight is entered. */
  finishedGramsPerPouch: number;
  pouchesPerKgFilm: number;

  goodMetres: number;
  inputMetres: number;
  /** Film in the finished pouches, kg. */
  netKg: number;
  /** Net + layout trim, kg — the research's "good film". */
  goodKg: number;
  /** What must be bought / run: good kg + process waste + setup. */
  inputKg: number;
  inputAreaM2: number;

  material: {
    net: number;
    trim: number;
    processWaste: number;
    total: number;
  };
  conversion: { lines: { id: string; label: string; amount: number }[]; total: number };
  tooling: ToolingResult;
  hardware: { lines: { id: string; label: string; amount: number }[]; total: number };

  firstOrder: OrderCost;
  repeatOrder: OrderCost;
  /** Tooling ₹ per pouch on the first order — why first and repeat must differ. */
  toolingPerPouch: number;
}

const pos = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;

/** Display rounding: 2 decimals, half-up. */
export const roundPaisa = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

function quoteLines(costBeforeProfit: number, quantity: number, profitPercent: number, gstPercent: number): QuoteLines {
  const cost = quantity > 0 ? costBeforeProfit / quantity : 0;
  const sellingPrice = cost * (1 + pos(profitPercent) / 100);
  const gst = (sellingPrice * pos(gstPercent)) / 100;
  return { cost, costPer1000: cost * 1000, sellingPrice, gst, invoicePrice: sellingPrice + gst };
}

function orderCost(factoryCost: number, input: PouchCostInput): OrderCost {
  const packing = (factoryCost * pos(input.packingPercent)) / 100;
  const costBeforeProfit = factoryCost + packing;
  const profit = (costBeforeProfit * pos(input.profitPercent)) / 100;
  const sellingPrice = costBeforeProfit + profit;
  const gst = (sellingPrice * pos(input.gstPercent)) / 100;
  return {
    factoryCost,
    packing,
    costBeforeProfit,
    profit,
    sellingPrice,
    gst,
    invoiceTotal: sellingPrice + gst,
    perPouch: quoteLines(costBeforeProfit, pos(input.quantity), input.profitPercent, input.gstPercent),
  };
}

export function computePouchCost(input: PouchCostInput): PouchCostResult {
  const structure = computeStructure(input.structure);
  const geometry = computePouchGeometry(input.geometry);
  const quantity = Math.floor(pos(input.quantity));
  const gsm = structure.totalGsm;

  // Metres of master web that end up as good pouches.
  const goodMetres = (quantity * geometry.repeatMm) / 1000 / geometry.lanes;
  const inputMetres =
    input.waste.mode === "simple"
      ? inputMetresForStage(goodMetres, input.waste.combinedPercent, input.waste.setupMetres ?? 0)
      : inputMetresForStages(goodMetres, input.waste.stages);

  const netKg = (quantity * geometry.pouchAreaM2 * gsm) / 1000;
  const goodKg = (quantity * geometry.purchasedAreaM2 * gsm) / 1000;
  const inputKg = webKg(inputMetres, geometry.slitWidthMm, gsm);
  const inputAreaM2 = (inputMetres * geometry.slitWidthMm) / 1000;

  const materialTotal = inputAreaM2 * structure.costPerM2;
  const materialNet = quantity * geometry.pouchAreaM2 * structure.costPerM2;
  const materialGood = quantity * geometry.purchasedAreaM2 * structure.costPerM2;
  const material = {
    net: materialNet,
    trim: materialGood - materialNet,
    processWaste: materialTotal - materialGood,
    total: materialTotal,
  };

  const conversionLines = input.conversion.map((line) => ({
    id: line.id,
    label: line.label,
    amount: inputKg * pos(line.ratePerKg) + (quantity / 1000) * pos(line.ratePer1000),
  }));
  const conversion = {
    lines: conversionLines,
    total: conversionLines.reduce((total, line) => total + line.amount, 0),
  };

  const tooling = input.tooling
    ? toolingCost(input.tooling)
    : { areaCm2: 0, costPerColour: 0, total: 0 };

  const hardwareLines = input.hardware
    .filter((line) => line.enabled)
    .map((line) => ({ id: line.id, label: line.label, amount: quantity * pos(line.ratePerPiece) }));
  const hardware = {
    lines: hardwareLines,
    total: hardwareLines.reduce((total, line) => total + line.amount, 0),
  };
  const hardwareGrams = input.hardware
    .filter((line) => line.enabled)
    .reduce((total, line) => total + pos(line.gramsPerPiece), 0);

  const repeatFactory = material.total + conversion.total + hardware.total;
  const firstFactory = repeatFactory + tooling.total;
  const filmGramsPerPouch = pouchFilmGrams(geometry.pouchAreaM2, gsm);

  return {
    structure,
    geometry,
    quantity,
    filmGramsPerPouch,
    finishedGramsPerPouch: filmGramsPerPouch + hardwareGrams,
    pouchesPerKgFilm: pouchesPerKg(geometry.pouchAreaM2, gsm),
    goodMetres,
    inputMetres,
    netKg,
    goodKg,
    inputKg,
    inputAreaM2,
    material,
    conversion,
    tooling,
    hardware,
    firstOrder: orderCost(firstFactory, input),
    repeatOrder: orderCost(repeatFactory, input),
    toolingPerPouch: quantity > 0 ? tooling.total / quantity : 0,
  };
}

export interface SlabRow {
  quantity: number;
  first: QuoteLines;
  repeat: QuoteLines;
}

/** The same job at several quantities. Tooling is fixed, so small slabs carry more of it. */
export function computeSlabs(input: PouchCostInput, quantities: number[]): SlabRow[] {
  return quantities
    .filter((quantity) => quantity > 0)
    .map((quantity) => {
      const result = computePouchCost({ ...input, quantity });
      return { quantity, first: result.firstOrder.perPouch, repeat: result.repeatOrder.perPouch };
    });
}
