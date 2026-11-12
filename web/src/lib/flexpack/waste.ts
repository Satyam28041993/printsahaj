/**
 * Process waste (product path). Layout trim is NOT handled here — it is already
 * inside the slit width, as purchased film.
 *
 *   input = good output ÷ (1 − run waste) + setup metres
 *
 * Stage-wise waste compounds from the LAST machine backwards
 * (pouching → slitting → lamination → printing).
 */

export interface WasteStage {
  id: string;
  label: string;
  /** Run waste as a percent of that machine's INPUT, e.g. 3 for 3%. */
  runWastePercent: number;
  /** Setup / make-ready metres on that machine. */
  setupMetres: number;
}

const pos = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

/** Run waste is capped here so a typo (100%) can never divide by zero. The UI says when the cap applies. */
export const MAX_RUN_WASTE_PERCENT = 95;

export const isWasteClamped = (percent: number): boolean => pos(percent) >= MAX_RUN_WASTE_PERCENT;

const wasteFraction = (percent: number): number => Math.min(MAX_RUN_WASTE_PERCENT, pos(percent)) / 100;

/** One machine: metres to feed in for `goodMetres` out. */
export function inputMetresForStage(goodMetres: number, runWastePercent: number, setupMetres = 0): number {
  return pos(goodMetres) / (1 - wasteFraction(runWastePercent)) + pos(setupMetres);
}

/**
 * Metres to start with at the first machine. `stages` are listed in PROCESS
 * order (print first, pouching last); the maths walks them in reverse.
 */
export function inputMetresForStages(goodMetres: number, stages: WasteStage[]): number {
  let metres = pos(goodMetres);
  for (let i = stages.length - 1; i >= 0; i -= 1) {
    metres = inputMetresForStage(metres, stages[i].runWastePercent, stages[i].setupMetres);
  }
  return metres;
}

/** The single combined percent that a list of stages is equivalent to (ignoring setup metres). */
export function combinedWastePercent(stages: WasteStage[]): number {
  const kept = stages.reduce((share, stage) => share * (1 - wasteFraction(stage.runWastePercent)), 1);
  return (1 - kept) * 100;
}

/** kg of a web: metres × width × GSM. */
export function webKg(metres: number, widthMm: number, gsm: number): number {
  return (pos(metres) * (pos(widthMm) / 1000) * pos(gsm)) / 1000;
}
