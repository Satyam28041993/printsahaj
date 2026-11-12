/**
 * Pouch geometry (product path). W, H, G in mm; areas in m².
 *
 * All sizes are OUTER sizes that already include the seal lands. If the buyer
 * gave inside (cavity) sizes, convert with `outerFromInside` FIRST — and only
 * once. Seals are never added twice.
 *
 *   3-side seal:  A = 2 × W × H                     (two panels)
 *   Stand-up:     A = W × (2H + G)                  (G = FULL unfolded gusset)
 *   Center-seal:  A = (2 × face + back seal) × repeat
 *   Side-gusset:  A ≈ H × (2W + 2G)                 (planning only)
 *   Flat-bottom / quad: no formula — owner enters the dieline area.
 *
 * Layout trim is purchased film, not a waste %:
 *   master web      = lanes × web per lane + 2 × edge trim
 *   purchased area  = master web × repeat / lanes        (per pouch)
 */

export type PouchType = "three-side-seal" | "center-seal" | "stand-up";

export type BackSealType = "fin" | "lap";

export type ThreeSideSealAcross = "width" | "height";

export interface PouchGeometryInput {
  type: PouchType;
  /** Outer width, mm. Center-seal: the face (front panel) width. */
  width: number;
  /** Outer height, mm. Center-seal: the cut-off / repeat length incl. both cross seals. */
  height: number;
  /** Stand-up only: FULL unfolded bottom gusset, mm (40+40 folded → 80). */
  gusset?: number;
  /** Center-seal only: TOTAL web consumed by the back seal, mm. */
  backSealAllowance?: number;
  /** Edge trim per side of the master web, mm. */
  edgeTrimPerSide: number;
  /** Pouches printed side by side across the master web. Default 1. */
  lanes?: number;
  /** Extra gap between pouches along the web, mm. Default 0. */
  repeatGap?: number;
  /**
   * 3-side seal only: which pouch dimension lies ACROSS the web.
   * "width" (default, the reference Excel): slit = 2 × W, repeat = H.
   * "height": slit = 2 × H, repeat = W. The pouch area is the same either way;
   * only the trim share and the print repeat change.
   */
  threeSideSealAcross?: ThreeSideSealAcross;
}

export interface PouchGeometry {
  /** Film in one finished pouch, m². */
  pouchAreaM2: number;
  /** Web one lane consumes, mm (no trim). */
  webPerLaneMm: number;
  /** Master (slit / printed) web width incl. edge trim, mm. */
  slitWidthMm: number;
  /** Length of web one pouch takes along the machine, mm. */
  repeatMm: number;
  lanes: number;
  /** Film bought per pouch incl. layout trim, m². */
  purchasedAreaM2: number;
  /** Layout trim as a share of the purchased area (0–1). Information only. */
  trimShare: number;
}

const pos = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;

/** 3-side seal: front + back panel. Never a single panel. */
export function threeSideSealAreaM2(width: number, height: number): number {
  return (2 * pos(width) * pos(height)) / 1_000_000;
}

/** Stand-up: two faces plus the FULL unfolded bottom gusset strip. */
export function standUpAreaM2(width: number, height: number, gussetUnfolded: number): number {
  return (pos(width) * (2 * pos(height) + pos(gussetUnfolded))) / 1_000_000;
}

/** Center-seal / pillow: tube web (two faces + back seal) × cut-off. */
export function centerSealAreaM2(faceWidth: number, repeat: number, backSealAllowance: number): number {
  return ((2 * pos(faceWidth) + pos(backSealAllowance)) * pos(repeat)) / 1_000_000;
}

/** Side-gusset bag, rectangular planning model only. G = opened-out depth per side. */
export function sideGussetAreaM2(width: number, height: number, gussetPerSide: number): number {
  return (pos(height) * (2 * pos(width) + 2 * pos(gussetPerSide))) / 1_000_000;
}

/** Helper for "40+40 folded → type 80". */
export function unfoldedGusset(foldedPerSide: number): number {
  return 2 * pos(foldedPerSide);
}

/**
 * Web consumed by the longitudinal seal of a pillow pack.
 * Fin: both edges meet inner-to-inner, so each edge gives one seal width (2 × seal).
 * Lap: the edges overlap, so the web gives the overlap once.
 * This is plain geometry and only a starting value — the owner can type the total.
 */
export function backSealAllowanceFor(type: BackSealType, sealWidth: number): number {
  return type === "fin" ? 2 * pos(sealWidth) : pos(sealWidth);
}

/**
 * Switching fin ↔ lap: re-fill the allowance only if it still holds the
 * untouched pre-fill of the old type. A total the owner typed is kept.
 */
export function backSealAllowanceOnSwitch(current: number, from: BackSealType, to: BackSealType, sealWidth = 10): number {
  return current === backSealAllowanceFor(from, sealWidth) ? backSealAllowanceFor(to, sealWidth) : current;
}

export interface InsideDimensions {
  type: PouchType;
  insideWidth: number;
  insideHeight: number;
  sealWidth: number;
  /** 3SS / stand-up: is the top seal already on the pre-made pouch? */
  topSealed?: boolean;
}

/** Inside (cavity) size → outer size. Use once; outer sizes go into the area formulas. */
export function outerFromInside(dims: InsideDimensions): { width: number; height: number } {
  const seal = pos(dims.sealWidth);
  if (dims.type === "center-seal") {
    // Face width has no side seals; the repeat carries both cross seals.
    return { width: pos(dims.insideWidth), height: pos(dims.insideHeight) + 2 * seal };
  }
  if (dims.type === "stand-up") {
    // Two side seals; the bottom is the gusset, the top seal only if pre-sealed.
    return {
      width: pos(dims.insideWidth) + 2 * seal,
      height: pos(dims.insideHeight) + (dims.topSealed ? seal : 0),
    };
  }
  return {
    width: pos(dims.insideWidth) + 2 * seal,
    height: pos(dims.insideHeight) + seal + (dims.topSealed ? seal : 0),
  };
}

export function computePouchGeometry(input: PouchGeometryInput): PouchGeometry {
  const lanes = Math.max(1, Math.floor(pos(input.lanes) || 1));
  const trim = pos(input.edgeTrimPerSide);
  const gap = pos(input.repeatGap);
  const w = pos(input.width);
  const h = pos(input.height);

  let pouchAreaM2: number;
  let webPerLaneMm: number;
  let pouchLengthMm: number;

  if (input.type === "stand-up") {
    const g = pos(input.gusset);
    pouchAreaM2 = standUpAreaM2(w, h, g);
    // Front, gusset and back are cut across the web; W runs along it.
    webPerLaneMm = 2 * h + g;
    pouchLengthMm = w;
  } else if (input.type === "center-seal") {
    const back = pos(input.backSealAllowance);
    pouchAreaM2 = centerSealAreaM2(w, h, back);
    webPerLaneMm = 2 * w + back;
    pouchLengthMm = h;
  } else {
    pouchAreaM2 = threeSideSealAreaM2(w, h);
    // Default is the reference printer Excel's convention: slit = 2 × pouch width.
    const heightAcross = input.threeSideSealAcross === "height";
    webPerLaneMm = 2 * (heightAcross ? h : w);
    pouchLengthMm = heightAcross ? w : h;
  }

  const repeatMm = pouchLengthMm + gap;
  const slitWidthMm = webPerLaneMm > 0 ? lanes * webPerLaneMm + 2 * trim : 0;
  const purchasedAreaM2 = (slitWidthMm * repeatMm) / lanes / 1_000_000;

  return {
    pouchAreaM2,
    webPerLaneMm,
    slitWidthMm,
    repeatMm,
    lanes,
    purchasedAreaM2,
    trimShare: purchasedAreaM2 > 0 ? Math.max(0, 1 - pouchAreaM2 / purchasedAreaM2) : 0,
  };
}

/** Film grams in one pouch (no zipper, no trim). */
export function pouchFilmGrams(pouchAreaM2: number, totalGsm: number): number {
  return pos(pouchAreaM2) * pos(totalGsm);
}

/** Pouches per kg of laminate, film only. */
export function pouchesPerKg(pouchAreaM2: number, totalGsm: number): number {
  const grams = pouchFilmGrams(pouchAreaM2, totalGsm);
  return grams > 0 ? 1000 / grams : 0;
}
