/**
 * The owner's rate book — one place for every rate the calculators use.
 *
 * Three kinds of default, and the UI must show which is which:
 *   "sourced" — a published figure; names its source and retrieval date.
 *   "example" — an illustration so the arithmetic is visible. NOT a market
 *               price. Shown with an Example tag until the owner changes it.
 *   "blank"   — no trustworthy figure exists; starts at 0 for the owner to fill.
 *
 * Nothing here is a conversion ₹/kg schedule: there is no trustworthy published
 * Indian one. The four conversion numbers are the worked example's, tagged Example.
 */

import { ALLIANCE_FLEXO_PLATE, KANODIA_CYLINDER } from "./cylinder";

export type RateTag = "sourced" | "example" | "blank" | "owner";

export interface ConversionRate {
  ratePerKg: number;
  ratePer1000: number;
}

export type ConversionId = "printing" | "lamination" | "slitting" | "pouching";

export interface RateBook {
  version: 1;
  /** ₹/kg by material id (see materials.ts). */
  filmRates: Record<string, number>;
  /** ₹ per DRY kg. */
  adhesiveRatePerKgDry: number;
  /** ₹ per DRY kg. */
  inkRatePerKgDry: number;
  conversion: Record<ConversionId, ConversionRate>;
  gravureRateBelow: number;
  gravureRateAbove: number;
  gravureThresholdMm: number;
  flexoPlateRate: number;
  zipperPerPiece: number;
  spoutPerPiece: number;
  valvePerPiece: number;
  packingPercent: number;
  profitPercent: number;
  gstPercent: number;
  combinedWastePercent: number;
  stageWaste: Record<ConversionId, { runWastePercent: number; setupMetres: number }>;
  edgeTrimMm: number;
  /** Field keys the owner has typed over. Their Example tag is dropped. */
  touched: string[];
  /** ISO timestamp of the last owner save, or null for untouched defaults. */
  savedAt: string | null;
}

export const CONVERSION_LABELS: Record<ConversionId, string> = {
  printing: "Printing",
  lamination: "Lamination",
  slitting: "Slitting",
  pouching: "Pouching",
};

export const CONVERSION_ORDER: ConversionId[] = ["printing", "lamination", "slitting", "pouching"];

export const DEFAULT_RATE_BOOK: RateBook = {
  version: 1,
  // Only the three films of the worked example carry an Example rate. Every
  // other film starts blank — we do not invent film prices.
  filmRates: {
    pet: 145,
    "met-pet": 185,
    ldpe: 125,
  },
  adhesiveRatePerKgDry: 400,
  inkRatePerKgDry: 550,
  conversion: {
    printing: { ratePerKg: 28, ratePer1000: 0 },
    lamination: { ratePerKg: 18, ratePer1000: 0 },
    slitting: { ratePerKg: 8, ratePer1000: 0 },
    pouching: { ratePerKg: 22, ratePer1000: 0 },
  },
  gravureRateBelow: KANODIA_CYLINDER.rateBelow,
  gravureRateAbove: KANODIA_CYLINDER.rateAbove,
  gravureThresholdMm: KANODIA_CYLINDER.thresholdCircumferenceMm,
  flexoPlateRate: ALLIANCE_FLEXO_PLATE.rate,
  zipperPerPiece: 0.9,
  spoutPerPiece: 0,
  valvePerPiece: 0,
  packingPercent: 0,
  profitPercent: 15,
  gstPercent: 18,
  combinedWastePercent: 5,
  stageWaste: {
    printing: { runWastePercent: 3, setupMetres: 800 },
    lamination: { runWastePercent: 2, setupMetres: 400 },
    slitting: { runWastePercent: 1, setupMetres: 100 },
    pouching: { runWastePercent: 4, setupMetres: 0 },
  },
  edgeTrimMm: 10,
  touched: [],
  savedAt: null,
};

export interface RateMeta {
  tag: Exclude<RateTag, "owner">;
  /** Short line shown under the field. */
  note: string;
}

const EXAMPLE_NOTE = "Example from the PrintSahaj worked example — not a market price. Type your own.";
const BLANK_NOTE = "No trustworthy published rate. Type your own.";

/** Tag and note for a rate-book field key (e.g. "filmRates.pet", "conversion.printing.ratePerKg"). */
export function defaultMetaFor(key: string): RateMeta {
  if (key.startsWith("filmRates.")) {
    const id = key.slice("filmRates.".length);
    return id in DEFAULT_RATE_BOOK.filmRates
      ? { tag: "example", note: EXAMPLE_NOTE }
      : { tag: "blank", note: "We do not publish film prices. Type your purchase rate." };
  }
  if (key.startsWith("conversion.")) {
    return key.endsWith(".ratePerKg")
      ? { tag: "example", note: "Example only. There is no trustworthy published Indian conversion schedule — use your plant's rate." }
      : { tag: "blank", note: BLANK_NOTE };
  }
  if (key.startsWith("stageWaste.")) {
    return {
      tag: "example",
      note: "Illustrative input from RollSpec's worked example — not an industry benchmark. Published starting ranges: print 2–4%, lam 1–3%, slit 1–2%.",
    };
  }
  switch (key) {
    case "gravureRateBelow":
    case "gravureRateAbove":
    case "gravureThresholdMm":
      return {
        tag: "sourced",
        note: `${KANODIA_CYLINDER.source}: ₹${KANODIA_CYLINDER.rateBelow.toFixed(2)}/cm² below ${KANODIA_CYLINDER.thresholdCircumferenceMm} mm circumference, ₹${KANODIA_CYLINDER.rateAbove.toFixed(2)} above. Retrieved ${KANODIA_CYLINDER.retrieved}. Your cylinder maker's rate will differ.`,
      };
    case "flexoPlateRate":
      return {
        tag: "example",
        note: `${ALLIANCE_FLEXO_PLATE.source} (retrieved ${ALLIANCE_FLEXO_PLATE.retrieved}). A pre-filled example input in their tool, not a market survey.`,
      };
    case "gstPercent":
      return {
        tag: "sourced",
        note: "18% for HSN 3920 / 3921 / 3923 (FundRaksha compilation of Notification 9/2025-CT(R), as of 21 Oct 2026). Foil- or paper-heavy packs may differ — confirm HSN with your CA. Not tax advice.",
      };
    case "combinedWastePercent":
      return {
        tag: "example",
        note: "Starting value: top of GSMCalculator's typical 3–5% combined range. A starting range, not a benchmark.",
      };
    case "edgeTrimMm":
      return { tag: "example", note: "10 mm per side is RollSpec's worked-example trim — an example, not a constant." };
    case "adhesiveRatePerKgDry":
    case "inkRatePerKgDry":
    case "zipperPerPiece":
    case "profitPercent":
      return { tag: "example", note: EXAMPLE_NOTE };
    default:
      return { tag: "blank", note: BLANK_NOTE };
  }
}

/** The tag to show right now: the owner's once they have typed over the default. */
export function tagFor(book: RateBook, key: string): RateTag {
  return book.touched.includes(key) ? "owner" : defaultMetaFor(key).tag;
}

export function filmRate(book: RateBook, materialId: string): number {
  const rate = book.filmRates[materialId];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : 0;
}

function readPath(target: unknown, path: string[]): unknown {
  return path.reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    target,
  );
}

/** Immutable set of one numeric field by dotted key; marks it as owner-edited. */
export function setRate(book: RateBook, key: string, value: number): RateBook {
  const safe = Number.isFinite(value) && value >= 0 ? value : 0;
  const path = key.split(".");
  const next = structuredCloneBook(book);
  let node = next as unknown as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i += 1) {
    const child = node[path[i]];
    if (!child || typeof child !== "object") return book;
    node = child as Record<string, unknown>;
  }
  node[path[path.length - 1]] = safe;
  if (!next.touched.includes(key)) next.touched = [...next.touched, key];
  return next;
}

export function getRate(book: RateBook, key: string): number {
  const value = readPath(book, key.split("."));
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function structuredCloneBook(book: RateBook): RateBook {
  return JSON.parse(JSON.stringify(book)) as RateBook;
}

export const RATE_BOOK_STORAGE_KEY = "printsahaj_flexpack_ratebook_v1";

export function serializeRateBook(book: RateBook): string {
  return JSON.stringify(book);
}

/**
 * Parse whatever is in storage. Unknown or damaged data falls back to the
 * defaults field by field — a bad value never becomes NaN in a quote.
 */
export function parseRateBook(raw: string | null | undefined): RateBook {
  const base = structuredCloneBook(DEFAULT_RATE_BOOK);
  if (!raw) return base;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return base;
  }
  if (!data || typeof data !== "object" || (data as { version?: unknown }).version !== 1) return base;
  const source = data as Record<string, unknown>;

  const num = (value: unknown, fallback: number): number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;

  if (source.filmRates && typeof source.filmRates === "object") {
    for (const [id, value] of Object.entries(source.filmRates as Record<string, unknown>)) {
      base.filmRates[id] = num(value, base.filmRates[id] ?? 0);
    }
  }
  const flat: (keyof RateBook)[] = [
    "adhesiveRatePerKgDry",
    "inkRatePerKgDry",
    "gravureRateBelow",
    "gravureRateAbove",
    "gravureThresholdMm",
    "flexoPlateRate",
    "zipperPerPiece",
    "spoutPerPiece",
    "valvePerPiece",
    "packingPercent",
    "profitPercent",
    "gstPercent",
    "combinedWastePercent",
    "edgeTrimMm",
  ];
  const writable = base as unknown as Record<string, unknown>;
  for (const key of flat) writable[key] = num(source[key], base[key] as number);

  for (const id of CONVERSION_ORDER) {
    const conv = readPath(source, ["conversion", id]) as Record<string, unknown> | undefined;
    if (conv) {
      base.conversion[id] = {
        ratePerKg: num(conv.ratePerKg, base.conversion[id].ratePerKg),
        ratePer1000: num(conv.ratePer1000, base.conversion[id].ratePer1000),
      };
    }
    const stage = readPath(source, ["stageWaste", id]) as Record<string, unknown> | undefined;
    if (stage) {
      base.stageWaste[id] = {
        runWastePercent: num(stage.runWastePercent, base.stageWaste[id].runWastePercent),
        setupMetres: num(stage.setupMetres, base.stageWaste[id].setupMetres),
      };
    }
  }
  if (Array.isArray(source.touched)) {
    base.touched = source.touched.filter((key): key is string => typeof key === "string");
  }
  base.savedAt = typeof source.savedAt === "string" ? source.savedAt : null;
  return base;
}
