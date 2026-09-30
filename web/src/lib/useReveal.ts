"use client";

import { useEffect, useRef } from "react";
import { markMotionReady, observeReveals } from "./reveal";

/**
 * Fades and rises every `[data-reveal]` / `.h-reveal` child as it scrolls into
 * view (CSS transition + the shared IntersectionObserver in ./reveal).
 *
 * Children are hidden before their reveal only while `html.js-motion` is set
 * by the inline script in layout.tsx, so a page without JS, or with reduced
 * motion, is fully visible.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    markMotionReady();
    return observeReveals(root);
  }, []);

  return ref;
}
