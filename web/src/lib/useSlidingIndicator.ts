"use client";

import { useEffect, type RefObject } from "react";

/**
 * Slides one shared indicator behind the active tab. Writes --ix/--iy/--iw/--ih
 * straight onto the tab row (no re-render) and flips data-ind="ready" once it
 * has measured. The first measure snaps into place; later ones animate
 * (data-anim="on"). Re-measures on resize and when the row's contents change.
 */
export function useSlidingIndicator(
  rowRef: RefObject<HTMLElement | null>,
  tabRefs: RefObject<Array<HTMLElement | null>>,
  active: number,
) {
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const tab = tabRefs.current[active];
      if (!tab) return;
      row.style.setProperty("--ix", `${tab.offsetLeft}px`);
      row.style.setProperty("--iy", `${tab.offsetTop}px`);
      row.style.setProperty("--iw", `${tab.offsetWidth}px`);
      row.style.setProperty("--ih", `${tab.offsetHeight}px`);
      if (row.dataset.ind !== "ready") {
        row.dataset.ind = "ready";
        // Enable the slide only after the first, snapped, paint.
        requestAnimationFrame(() => requestAnimationFrame(() => (row.dataset.anim = "on")));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [rowRef, tabRefs, active]);
}
