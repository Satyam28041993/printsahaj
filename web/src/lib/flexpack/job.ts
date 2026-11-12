/**
 * The shared job the four calculators work on (structure + pouch + order), and
 * the pure functions that turn it into engine input. No React, no storage —
 * the UI store in components/flexpack/store.ts only persists it.
 */

import { kanodiaRateFor, type PrintProcess } from "./cylinder";
import {
  ADHESIVE_DEFAULTS,
  INK_DRY_GSM_DEFAULT,
  MATERIALS,
  METAL_ADD_ON_GSM_DEFAULT,
  getMaterial,
  type AdhesiveType,
  type StructurePreset,
} from "./materials";
import type { BackSealType, PouchType, ThreeSideSealAcross } from "./pouch";
import type { PouchCostInput } from "./pouchCost";
import { CONVERSION_LABELS, CONVERSION_ORDER, filmRate, type ConversionId, type RateBook } from "./rateBook";
import type { StructureInput } from "./structure";

export interface JobLayer {
  uid: string;
  materialId: string;
  /** Microns (film/foil) — or mill GSM when the material is paper. */
  thickness: number;
  density: number;
  /** Optional weighed / TDS GSM for a film. */
  measuredGsm: number | null;
  metalAddOnGsm: number;
}

export interface JobState {
  version: 1;
  advanced: boolean;
  layers: JobLayer[];
  adhesiveType: AdhesiveType;
  /** Dry GSM per bond, one entry per bond. */
  bondDryGsm: number[];
  inkDryGsm: number;
  pouchType: PouchType;
  width: number;
  height: number;
  gusset: number;
  backSealType: BackSealType;
  backSealAllowance: number;
  lanes: number;
  repeatGap: number;
  /** 3SS only (Advanced): which dimension lies across the web. */
  threeSideSealAcross: ThreeSideSealAcross;
  quantity: number;
  wasteMode: "simple" | "stages";
  simpleSetupMetres: number;
  printed: boolean;
  process: PrintProcess;
  colours: number;
  faceLengthMm: number;
  circumferenceMm: number;
  zipper: boolean;
  spout: boolean;
  valve: boolean;
}

export const MAX_LAYERS = 6;

let uidCounter = 0;
export const newUid = (): string => `l${Date.now().toString(36)}${(uidCounter += 1)}`;

export function makeLayer(materialId: string, thickness: number): JobLayer {
  const material = getMaterial(materialId);
  return {
    uid: newUid(),
    materialId: material.id,
    thickness,
    density: material.density ?? 0,
    measuredGsm: null,
    metalAddOnGsm: material.metallised ? METAL_ADD_ON_GSM_DEFAULT : 0,
  };
}

/** Opening state = the researched worked example (160 × 240 + 80 standy, 50,000 pcs). */
export const DEFAULT_JOB: JobState = {
  version: 1,
  advanced: false,
  layers: [
    { ...makeLayer("pet", 12), uid: "d1" },
    { ...makeLayer("met-pet", 12), uid: "d2" },
    { ...makeLayer("ldpe", 70), uid: "d3" },
  ],
  adhesiveType: "solvent-based",
  bondDryGsm: [2.5, 2.5],
  inkDryGsm: INK_DRY_GSM_DEFAULT,
  pouchType: "stand-up",
  width: 160,
  height: 240,
  gusset: 80,
  backSealType: "fin",
  backSealAllowance: 20,
  lanes: 1,
  repeatGap: 0,
  threeSideSealAcross: "width",
  quantity: 50_000,
  wasteMode: "simple",
  simpleSetupMetres: 0,
  printed: true,
  process: "gravure",
  colours: 6,
  faceLengthMm: 600,
  circumferenceMm: 640,
  zipper: true,
  spout: false,
  valve: false,
};

/** Keep one dry-GSM entry per bond as layers are added or removed. */
export function syncBonds(bondDryGsm: number[], layerCount: number, type: AdhesiveType): number[] {
  const needed = Math.max(0, layerCount - 1);
  const next = bondDryGsm.slice(0, needed);
  while (next.length < needed) next.push(ADHESIVE_DEFAULTS[type].dryGsm);
  return next;
}

export function layersFromPreset(preset: StructurePreset): JobLayer[] {
  return preset.layers.map((layer) => makeLayer(layer.materialId, layer.thickness));
}

/* --------------------------------------------------------------- sanitising */

type Loose = Record<string, unknown>;

const isObject = (value: unknown): value is Loose => typeof value === "object" && value !== null && !Array.isArray(value);

/** A finite number inside [min, max], else the fallback. */
function numberIn(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : fallback;
}

const bool = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function sanitizeLayer(value: unknown, index: number): JobLayer | null {
  if (!isObject(value) || typeof value.materialId !== "string") return null;
  const material = MATERIALS.find((item) => item.id === value.materialId);
  if (!material) return null;
  const measured = numberIn(value.measuredGsm, 0, 0, 2000);
  return {
    uid: typeof value.uid === "string" && value.uid ? `${value.uid}`.slice(0, 40) : `s${index}`,
    materialId: material.id,
    thickness: numberIn(value.thickness, material.typical[0] ?? 12, 0, 2000),
    density: numberIn(value.density, material.density ?? 0, 0, 25),
    measuredGsm: measured > 0 ? measured : null,
    metalAddOnGsm: numberIn(value.metalAddOnGsm, material.metallised ? METAL_ADD_ON_GSM_DEFAULT : 0, 0, 50),
  };
}

/**
 * Whatever was in storage → a job the UI can always render. Every field is
 * checked on its own: a wrong type or an out-of-range number falls back to the
 * default for that field only, and a damaged layer list falls back to the
 * default structure. Nothing here can produce NaN or a crash.
 */
export function sanitizeJob(data: unknown): JobState {
  if (!isObject(data) || data.version !== 1) return DEFAULT_JOB;
  const d = DEFAULT_JOB;

  const rawLayers = Array.isArray(data.layers) ? data.layers : [];
  const seen = new Set<string>();
  const layers: JobLayer[] = [];
  rawLayers.forEach((raw, index) => {
    const layer = sanitizeLayer(raw, index);
    if (!layer || layers.length >= MAX_LAYERS) return;
    if (seen.has(layer.uid)) layer.uid = `s${index}_${layers.length}`;
    seen.add(layer.uid);
    layers.push(layer);
  });
  const safeLayers = layers.length > 0 ? layers : d.layers;

  const adhesiveType = oneOf<AdhesiveType>(data.adhesiveType, ["solvent-based", "solventless"], d.adhesiveType);
  const rawBonds = Array.isArray(data.bondDryGsm) ? data.bondDryGsm : [];
  const bonds = rawBonds.map((value) => numberIn(value, ADHESIVE_DEFAULTS[adhesiveType].dryGsm, 0, 50));

  return {
    version: 1,
    advanced: bool(data.advanced, d.advanced),
    layers: safeLayers,
    adhesiveType,
    bondDryGsm: syncBonds(bonds, safeLayers.length, adhesiveType),
    inkDryGsm: numberIn(data.inkDryGsm, d.inkDryGsm, 0, 50),
    pouchType: oneOf<PouchType>(data.pouchType, ["three-side-seal", "center-seal", "stand-up"], d.pouchType),
    width: numberIn(data.width, d.width, 0, 5000),
    height: numberIn(data.height, d.height, 0, 5000),
    gusset: numberIn(data.gusset, d.gusset, 0, 2000),
    backSealType: oneOf<BackSealType>(data.backSealType, ["fin", "lap"], d.backSealType),
    backSealAllowance: numberIn(data.backSealAllowance, d.backSealAllowance, 0, 500),
    lanes: Math.floor(numberIn(data.lanes, d.lanes, 1, 50)),
    repeatGap: numberIn(data.repeatGap, d.repeatGap, 0, 1000),
    threeSideSealAcross: oneOf<ThreeSideSealAcross>(data.threeSideSealAcross, ["width", "height"], d.threeSideSealAcross),
    quantity: Math.floor(numberIn(data.quantity, d.quantity, 0, 1e10)),
    wasteMode: oneOf(data.wasteMode, ["simple", "stages"] as const, d.wasteMode),
    simpleSetupMetres: numberIn(data.simpleSetupMetres, d.simpleSetupMetres, 0, 1e6),
    printed: bool(data.printed, d.printed),
    process: oneOf<PrintProcess>(data.process, ["gravure", "flexo"], d.process),
    colours: Math.floor(numberIn(data.colours, d.colours, 0, 20)),
    faceLengthMm: numberIn(data.faceLengthMm, d.faceLengthMm, 0, 10000),
    circumferenceMm: numberIn(data.circumferenceMm, d.circumferenceMm, 0, 10000),
    zipper: bool(data.zipper, d.zipper),
    spout: bool(data.spout, d.spout),
    valve: bool(data.valve, d.valve),
  };
}

export function parseJob(raw: string | null | undefined): JobState {
  if (!raw) return DEFAULT_JOB;
  try {
    return sanitizeJob(JSON.parse(raw));
  } catch {
    return DEFAULT_JOB;
  }
}

/* ------------------------------------------------------------- engine input */

/**
 * Job + rate book → the engine's structure input.
 * `unprinted` drops the ink line. Only the pouch-cost path passes it (that is
 * where the "Printed job" switch lives); the structure tool always counts the
 * ink GSM it shows.
 */
export function structureInputFor(job: JobState, book: RateBook, unprinted = false): StructureInput {
  return {
    layers: job.layers.map((layer) => {
      const paper = getMaterial(layer.materialId).kind === "paper";
      return {
        materialId: layer.materialId,
        micron: paper ? 0 : layer.thickness,
        density: layer.density,
        measuredGsm: paper ? layer.thickness : layer.measuredGsm,
        metalAddOnGsm: layer.metalAddOnGsm,
        ratePerKg: filmRate(book, layer.materialId),
      };
    }),
    bonds: syncBonds(job.bondDryGsm, job.layers.length, job.adhesiveType).map((dryGsm) => ({
      type: job.adhesiveType,
      dryGsm,
      ratePerKgDry: book.adhesiveRatePerKgDry,
    })),
    ink: { dryGsm: unprinted ? 0 : job.inkDryGsm, ratePerKgDry: book.inkRatePerKgDry },
  };
}

/** The machines a job actually runs on. A plain pouch never goes through the press. */
export function stagesFor(job: Pick<JobState, "printed">): ConversionId[] {
  return CONVERSION_ORDER.filter((id) => job.printed || id !== "printing");
}

/** ₹/cm² for the job's cylinders or plates, from the rate book. */
export function toolingRateFor(job: Pick<JobState, "process" | "circumferenceMm">, book: RateBook): number {
  return job.process === "gravure"
    ? kanodiaRateFor(job.circumferenceMm, {
        rateBelow: book.gravureRateBelow,
        rateAbove: book.gravureRateAbove,
        thresholdCircumferenceMm: book.gravureThresholdMm,
      })
    : book.flexoPlateRate;
}

/**
 * Job + rate book → pouch-cost engine input.
 * A plain (unprinted) job drops ink, cylinders/plates, the printing conversion
 * line, the printing waste stage and its setup metres.
 */
export function costInputFor(job: JobState, book: RateBook): PouchCostInput {
  const stages = stagesFor(job);
  return {
    structure: structureInputFor(job, book, !job.printed),
    geometry: {
      type: job.pouchType,
      width: job.width,
      height: job.height,
      gusset: job.gusset,
      backSealAllowance: job.backSealAllowance,
      edgeTrimPerSide: book.edgeTrimMm,
      lanes: job.advanced ? job.lanes : 1,
      repeatGap: job.advanced ? job.repeatGap : 0,
      threeSideSealAcross: job.advanced ? job.threeSideSealAcross : "width",
    },
    quantity: job.quantity,
    waste:
      job.advanced && job.wasteMode === "stages"
        ? {
            mode: "stages",
            stages: stages.map((id) => ({ id, label: CONVERSION_LABELS[id], ...book.stageWaste[id] })),
          }
        : { mode: "simple", combinedPercent: book.combinedWastePercent, setupMetres: job.advanced ? job.simpleSetupMetres : 0 },
    conversion: stages.map((id) => ({ id, label: CONVERSION_LABELS[id], ...book.conversion[id] })),
    tooling: job.printed
      ? {
          faceLengthMm: job.faceLengthMm,
          circumferenceMm: job.circumferenceMm,
          colours: job.colours,
          ratePerCm2: toolingRateFor(job, book),
        }
      : null,
    hardware: [
      { id: "zipper", label: "Zipper", enabled: job.zipper, ratePerPiece: book.zipperPerPiece },
      { id: "spout", label: "Spout / cap", enabled: job.spout, ratePerPiece: book.spoutPerPiece },
      { id: "valve", label: "Valve", enabled: job.valve, ratePerPiece: book.valvePerPiece },
    ],
    packingPercent: book.packingPercent,
    profitPercent: book.profitPercent,
    gstPercent: book.gstPercent,
  };
}
