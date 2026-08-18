"use client";

import { useLayoutEffect, useRef } from "react";
import {
  ensureGsap,
  REVEAL_DISTANCE,
  REVEAL_DURATION,
  REVEAL_EASE,
  REVEAL_STAGGER,
  ScrollTrigger,
} from "./motion";

export interface RevealOptions {
  /** Selector for the children to stagger. Defaults to `[data-reveal]`. */
  selector?: string;
  /** Delay between children. */
  stagger?: number;
  /** Where the trigger fires, in ScrollTrigger's syntax. */
  start?: string;
}

/**
 * Fades and rises the matched children once, as the container scrolls into view.
 *
 * Children must be authored in their FINAL state in markup — this hook sets the
 * pre-animation state itself via `gsap.from`. That way a visitor with reduced
 * motion, or one on a failed JS load, sees a correct page rather than an
 * invisible one.
 */
export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const {
    selector = "[data-reveal]",
    stagger = REVEAL_STAGGER,
    start = "top 82%",
  } = options;
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>(selector, container);
        if (targets.length === 0) return;

        gsap.from(targets, {
          opacity: 0,
          y: REVEAL_DISTANCE,
          duration: REVEAL_DURATION,
          ease: REVEAL_EASE,
          stagger,
          scrollTrigger: {
            trigger: container,
            start,
            once: true,
          },
        });
      });
      return () => mm.revert();
    }, container);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [selector, stagger, start]);

  return ref;
}
