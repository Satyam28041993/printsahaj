/**
 * Film library, coat-weight starting values and Indian structure presets.
 *
 * Every number here is a STARTING value the owner can overwrite. Densities and
 * coat weights name their source (docs/flexible-packaging-calculators/01-research.md,
 * re-checked in 04-verification-notes.md). There are no rupees in this file.
 */

export type MaterialKind = "film" | "foil" | "paper";

export interface Material {
  id: string;
  /** Trade name as an Indian converter would say it. */
  label: string;
  kind: MaterialKind;
  /**
   * g/cm³. `null` for paper: paper is bought and specified in mill GSM, never
   * estimated from a density.
   */
  density: number | null;
  /** Published range, for the helper text. */
  densityRange?: [number, number];
  /** Metallised film: base density is unchanged, the metal is a small GSM add-on. */
  metallised?: boolean;
  /** Typical microns (or GSM for paper) shown as quick picks. */
  typical: number[];
  source: string;
  note?: string;
}

/** Research mid-point of the 0.5–1.0 GSM aluminium deposit (CloudFilm). A labelled assumption. */
export const METAL_ADD_ON_GSM_DEFAULT = 0.8;
export const METAL_ADD_ON_GSM_RANGE: [number, number] = [0.5, 1.0];
export const METAL_ADD_ON_SOURCE =
  "Assumption: mid-point of the 0.5–1.0 GSM aluminium deposit in CloudFilm's density guide. Use the metalliser's measured GSM when you have it.";

export const MATERIALS: Material[] = [
  {
    id: "pet",
    label: "PET",
    kind: "film",
    density: 1.4,
    densityRange: [1.39, 1.41],
    typical: [10, 12, 23, 36],
    source: "Cosmo Films CF-B0-CPF BOPET TDS — 1.40 g/cc (12 µm = 16.80 GSM)",
  },
  {
    id: "met-pet",
    label: "MET PET",
    kind: "film",
    density: 1.4,
    densityRange: [1.39, 1.41],
    metallised: true,
    typical: [10, 12, 23],
    source: "Same base film as PET (Cosmo 1.40 g/cc) + metal add-on",
  },
  {
    id: "bopp",
    label: "BOPP",
    kind: "film",
    density: 0.905,
    densityRange: [0.9, 0.91],
    typical: [15, 18, 20, 25, 30],
    source: "RollSpec materials table; Balaji International 0.90–0.91",
    note: "Matte or cavitated (pearl/white) BOPP can be much lighter — a Cosmo matte grade lists 0.84 g/cc. Use the grade TDS or a measured GSM.",
  },
  {
    id: "met-bopp",
    label: "MET BOPP",
    kind: "film",
    density: 0.905,
    densityRange: [0.9, 0.91],
    metallised: true,
    typical: [15, 18, 20],
    source: "Same base film as BOPP + metal add-on",
  },
  {
    id: "cpp",
    label: "CPP",
    kind: "film",
    density: 0.9,
    densityRange: [0.89, 0.91],
    typical: [20, 25, 30, 60, 70, 80],
    source: "RollSpec materials table",
  },
  {
    id: "met-cpp",
    label: "MET CPP",
    kind: "film",
    density: 0.9,
    densityRange: [0.89, 0.91],
    metallised: true,
    typical: [20, 25, 30],
    source: "Same base film as CPP + metal add-on",
  },
  {
    id: "ldpe",
    label: "LDPE (POLY)",
    kind: "film",
    density: 0.922,
    densityRange: [0.915, 0.928],
    typical: [40, 50, 60, 70, 80, 90, 100],
    source: "RollSpec materials table (nominal 0.922)",
    note: "Blown PE is often an LD + LLD blend and can run a few percent heavy. Once a roll is in the factory, use measured GSM.",
  },
  {
    id: "lldpe",
    label: "LLDPE",
    kind: "film",
    density: 0.92,
    densityRange: [0.915, 0.93],
    typical: [40, 50, 60, 70, 80],
    source: "Balaji International, micron to GSM (0.92)",
  },
  {
    id: "hdpe",
    label: "HDPE",
    kind: "film",
    density: 0.955,
    densityRange: [0.945, 0.965],
    typical: [20, 30, 40, 50],
    source: "RollSpec materials table",
  },
  {
    id: "alu",
    label: "Alu foil",
    kind: "foil",
    density: 2.7,
    densityRange: [2.69, 2.71],
    typical: [6.35, 7, 9, 12, 20],
    source: "RollSpec materials table",
    note: "Metal only — lacquer and adhesive are separate lines.",
  },
  {
    id: "bopa",
    label: "Nylon (BOPA)",
    kind: "film",
    density: 1.15,
    densityRange: [1.14, 1.16],
    typical: [12, 15, 20, 25],
    source: "Jindal Nylon Films FILMON BXB TDS, Jan 2023 — 1.15 g/cc",
  },
  {
    id: "evoh",
    label: "EVOH",
    kind: "film",
    density: 1.14,
    densityRange: [1.12, 1.19],
    typical: [3, 5, 8],
    source: "Kuraray EVAL E105B TDS (44 mol% ethylene) — 1.14 g/cm³",
    note: "Grade-specific: density falls as ethylene content rises. Put your grade's TDS density here.",
  },
  {
    id: "paper",
    label: "Paper",
    kind: "paper",
    density: null,
    typical: [40, 50, 60, 70],
    source: "Paper is bought in mill GSM (GT Pack; Nalyquo) — enter the GSM, never a density",
  },
  {
    id: "custom",
    label: "Custom film",
    kind: "film",
    density: 1,
    typical: [],
    source: "Owner-entered. Type the density from your supplier TDS.",
  },
];

export function getMaterial(id: string): Material {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[MATERIALS.length - 1];
}

/* ------------------------------------------------------------------ adhesive */

export type AdhesiveType = "solvent-based" | "solventless";

export interface AdhesiveDefault {
  type: AdhesiveType;
  label: string;
  /** Dry GSM per bond. */
  dryGsm: number;
  dryGsmRange: [number, number];
  /** Solids at the coating head, %. Solventless is 100 by definition. */
  solidsPercent: number;
  source: string;
}

export const ADHESIVE_DEFAULTS: Record<AdhesiveType, AdhesiveDefault> = {
  "solvent-based": {
    type: "solvent-based",
    label: "Solvent-based (SB)",
    dryGsm: 2.5,
    dryGsmRange: [2.0, 2.8],
    solidsPercent: 30,
    source:
      "Dry 2.0–2.8 GSM per bond on film/foil (Cytech HILAM GP-50 guide; 3.0–3.5 on paper). 2.5 is GSMCalculator's 2-ply default. Solids % is a starting value — read it off your adhesive TDS.",
  },
  solventless: {
    type: "solventless",
    label: "Solventless (SL)",
    dryGsm: 1.8,
    dryGsmRange: [1.2, 2.8],
    solidsPercent: 100,
    source:
      "Dry 1.2–2.8 GSM per bond (Toplusse: light 1.2–1.8, medium 1.8–2.2, retort 2.2–2.8). 100% solids, so wet = dry.",
  },
};

/** Dry ink laydown starting value: RollSpec's snack-laminate example (1.5 GSM average on the printed area). */
export const INK_DRY_GSM_DEFAULT = 1.5;
export const INK_SOURCE =
  "1.5 GSM average dry ink is RollSpec's printed snack-laminate example. Gravure starting bands per colour (GSMCalculator): shallow 1.0–1.2, standard 1.2–1.8, heavy 1.8–2.5, then × coverage %.";

/* ------------------------------------------------------------------- presets */

export interface PresetLayer {
  materialId: string;
  /** Microns for films and foil, mill GSM for paper. */
  thickness: number;
}

export interface StructurePreset {
  id: string;
  name: string;
  endUse: string;
  layers: PresetLayer[];
  source: string;
}

/** Published Indian structures. Microns are typical or stated specs, not a national standard. */
export const STRUCTURE_PRESETS: StructurePreset[] = [
  {
    id: "chips-3ply",
    name: "PET 12 / MET PET 12 / PE 50",
    endUse: "Chips, namkeen",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "met-pet", thickness: 12 },
      { materialId: "ldpe", thickness: 50 },
    ],
    source: "Cosmo typical laminates; GSMCalculator 3-ply preset",
  },
  {
    id: "standy-3ply",
    name: "PET 12 / MET PET 12 / LDPE 70",
    endUse: "Zipper standy (worked example)",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "met-pet", thickness: 12 },
      { materialId: "ldpe", thickness: 70 },
    ],
    source: "PrintSahaj research worked example (01-research.md §8)",
  },
  {
    id: "snacks-2ply",
    name: "PET 12 / PE 40",
    endUse: "Snacks, tea, atta (2-layer)",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "ldpe", thickness: 40 },
    ],
    source: "Kanodia laminated-films table; GSMCalculator 2-ply presets",
  },
  {
    id: "biscuit-bopp",
    name: "BOPP 18 / BOPP 18",
    endUse: "Biscuits, candy, overwrap",
    layers: [
      { materialId: "bopp", thickness: 18 },
      { materialId: "bopp", thickness: 18 },
    ],
    source: "Cosmo typical laminates (outer BOPP 15–20 µm)",
  },
  {
    id: "bopp-metbopp",
    name: "BOPP 18 / MET BOPP 18",
    endUse: "Biscuits, confectionery (metallised)",
    layers: [
      { materialId: "bopp", thickness: 18 },
      { materialId: "met-bopp", thickness: 18 },
    ],
    source: "Cosmo typical laminates",
  },
  {
    id: "namkeen-bopp-met",
    name: "BOPP 18 / MET PET 12 / LDPE 90",
    endUse: "Namkeen, gas-flushed snacks",
    layers: [
      { materialId: "bopp", thickness: 18 },
      { materialId: "met-pet", thickness: 12 },
      { materialId: "ldpe", thickness: 90 },
    ],
    source: "Wahren, Noida — published spec",
  },
  {
    id: "coffee-foil",
    name: "PET 12 / Alu 9 / PE 70",
    endUse: "Coffee, spices, pharma sachets",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "alu", thickness: 9 },
      { materialId: "ldpe", thickness: 70 },
    ],
    source: "GT Pack Industries (PET 12 / Alu 6–20 / PE 60–100)",
  },
  {
    id: "paper-foil",
    name: "Paper 50 GSM / Alu 9 / PE 60",
    endUse: "Tea, ORS, pharma sachets (paper outer)",
    layers: [
      { materialId: "paper", thickness: 50 },
      { materialId: "alu", thickness: 9 },
      { materialId: "ldpe", thickness: 60 },
    ],
    source: "GT Pack Industries (paper 40–70 GSM / Alu 9–12 / PE 60–80)",
  },
  {
    id: "retort-4ply",
    name: "PET 12 / Alu 9 / BON 15 / CPP 70",
    endUse: "Retort (non-microwaveable)",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "alu", thickness: 9 },
      { materialId: "bopa", thickness: 15 },
      { materialId: "cpp", thickness: 70 },
    ],
    source: "Floeter India, Manesar — published retort spec",
  },
  {
    id: "retort-3ply",
    name: "PET 12 / Alu 9 / CPP 70",
    endUse: "Retort alternative (3-layer)",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "alu", thickness: 9 },
      { materialId: "cpp", thickness: 70 },
    ],
    source: "GT Pack Industries (PET 12 / Alu 9–12 / CPP 60–80)",
  },
  {
    id: "vacuum-nylon",
    name: "PET 12 / Nylon 15 / PE 60",
    endUse: "Meat, cheese, vacuum packs",
    layers: [
      { materialId: "pet", thickness: 12 },
      { materialId: "bopa", thickness: 15 },
      { materialId: "ldpe", thickness: 60 },
    ],
    source: "GSMCalculator 3-ply preset; Kanodia",
  },
];
