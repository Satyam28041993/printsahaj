"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  ADHESIVE_DEFAULTS,
  DEFAULT_RATE_BOOK,
  INK_DRY_GSM_DEFAULT,
  METAL_ADD_ON_GSM_DEFAULT,
  RATE_BOOK_STORAGE_KEY,
  filmRate,
  getMaterial,
  parseRateBook,
  serializeRateBook,
  setRate,
  type AdhesiveType,
  type BackSealType,
  type PouchType,
  type PrintProcess,
  type RateBook,
  type StructureInput,
  type StructurePreset,
  type ThreeSideSealAcross,
} from "@/lib/flexpack";

/* ------------------------------------------------------------ tiny LS store */

interface Store<T> {
  subscribe: (listener: () => void) => () => void;
  get: () => T;
  getServer: () => T;
  set: (next: T) => void;
}

function createStore<T>(key: string, fallback: T, parse: (raw: string | null) => T, serialize: (value: T) => string): Store<T> {
  let cache: T | null = null;
  const listeners = new Set<() => void>();
  const read = (): T => {
    try {
      return parse(window.localStorage.getItem(key));
    } catch {
      return fallback;
    }
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        cache = read();
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    get() {
      if (cache === null) cache = read();
      return cache;
    },
    getServer: () => fallback,
    set(next) {
      cache = next;
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch {
        // Private mode / storage full: the value still lives for this visit.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

/* ---------------------------------------------------------------- rate book */

const rateBookStore = createStore<RateBook>(RATE_BOOK_STORAGE_KEY, DEFAULT_RATE_BOOK, parseRateBook, serializeRateBook);

export function useRateBook() {
  const book = useSyncExternalStore(rateBookStore.subscribe, rateBookStore.get, rateBookStore.getServer);
  const setBookRate = useCallback((key: string, value: number) => {
    rateBookStore.set({ ...setRate(rateBookStore.get(), key, value), savedAt: new Date().toISOString() });
  }, []);
  const resetBook = useCallback(() => rateBookStore.set(parseRateBook(null)), []);
  return { book, setBookRate, resetBook };
}

/* ---------------------------------------------------------------------- job */

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

function parseJob(raw: string | null): JobState {
  if (!raw) return DEFAULT_JOB;
  try {
    const data = JSON.parse(raw) as Partial<JobState>;
    if (!data || data.version !== 1 || !Array.isArray(data.layers) || data.layers.length === 0) return DEFAULT_JOB;
    return { ...DEFAULT_JOB, ...data };
  } catch {
    return DEFAULT_JOB;
  }
}

const jobStore = createStore<JobState>("printsahaj_flexpack_job_v1", DEFAULT_JOB, parseJob, JSON.stringify);

export function useJob() {
  const job = useSyncExternalStore(jobStore.subscribe, jobStore.get, jobStore.getServer);
  const patch = useCallback((changes: Partial<JobState>) => jobStore.set({ ...jobStore.get(), ...changes }), []);
  const resetJob = useCallback(() => jobStore.set(DEFAULT_JOB), []);
  return { job, patch, resetJob };
}

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

/** Job + rate book → the engine's structure input. */
export function structureInputFor(job: JobState, book: RateBook): StructureInput {
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
    ink: { dryGsm: job.printed ? job.inkDryGsm : 0, ratePerKgDry: book.inkRatePerKgDry },
  };
}
