/**
 * Motion tokens. Every duration, ease and distance used by the GSAP layer comes
 * from here, so the whole site moves with one voice.
 */

/** cubic-bezier(.16, 1, .3, 1) */
export const EASE_OUT = "expo.out";
export const EASE_SPRING = "back.out(1.7)";
/** The CSS twin of EASE_SPRING for transitions that GSAP does not own. */
export const CSS_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const DUR = { fast: 0.22, base: 0.5, slow: 0.9, xslow: 1.2 } as const;

/** Reveal travel in px. Large enough to read while the thumb is still moving. */
export const RISE = { mobile: 44, desktop: 64 } as const;

export const STAGGER = 0.09;

/** ScrollTrigger `scrub` smoothing: tighter on touch, softer with a wheel. */
export const SCRUB = { mobile: 0.6, desktop: 1 } as const;

export const MEDIA = {
  mobile: "(max-width: 767px)",
  desktop: "(min-width: 768px)",
  fine: "(hover: hover) and (pointer: fine)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;
