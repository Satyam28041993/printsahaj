"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registers ScrollTrigger exactly once. Safe to call from every component that
 * needs it; the plugin throws warnings if registered repeatedly.
 */
export function ensureGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };

/** Shared reveal language: fade plus a 24px rise. */
export const REVEAL_DISTANCE = 24;
export const REVEAL_DURATION = 0.7;
export const REVEAL_EASE = "power2.out";
export const REVEAL_STAGGER = 0.09;

/**
 * True when the visitor has asked for reduced motion. Timelines are not built at
 * all in that case — elements are authored in their final state, so there is
 * nothing to resolve.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
