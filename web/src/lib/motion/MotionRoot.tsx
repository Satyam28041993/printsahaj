"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadMotion, whenWanted } from "./loader";
import { MEDIA } from "./tokens";

/** A visitor who only reads the hero pays nothing for motion until this long after load (or their first scroll/tap). */
const START_DELAY_MS = 4000;
/** Once loading has started, the library has this long before the page is shown as-is (`motion-off`). */
const FAILSAFE_AFTER_START_MS = 2000;
const SELECTOR_HIDDEN =
  '[data-m="reveal"], [data-m="pop"], [data-m="lines"], [data-m-child]';

/**
 * Mounted once per page that uses data-m hooks. Loads GSAP after first paint,
 * then builds every animation the page declared. Renders nothing.
 *
 * When it loads: at the visitor's first scroll / tap / key press, or START_DELAY_MS
 * after load, or straight away if an element that is hidden until the library
 * arrives is already in view. GSAP is a ~50 KB script to parse, and doing that
 * right after hydration is what costs mobile Lighthouse its total blocking time.
 *
 * Reduced motion gets no motion contexts at all: GSAP is not even downloaded.
 * Safety: `motion-ready` stands the inline failsafe (layout.tsx) down at mount, so
 * this component owns the fallback: once loading has started, if the library has
 * not built the page within FAILSAFE_AFTER_START_MS (or the import fails) it drops
 * every hidden pre-state (`motion-off`); a late library then skips the entrance
 * builders so already-shown content is never hidden again.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia(MEDIA.reduce).matches || !root.classList.contains("js-motion")) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;
    let failsafe: ReturnType<typeof setTimeout> | undefined;
    root.classList.add("motion-ready");

    const giveUp = () => {
      root.classList.add("motion-off");
      root.classList.remove("js-motion");
    };

    const onVisibility = () => root.toggleAttribute("data-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    // Is anything that stays hidden until GSAP builds already on screen?
    const hiddenInView = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR_HIDDEN)).some((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    });

    const cancelWait = whenWanted(
      () => {
        failsafe = setTimeout(() => {
          if (!teardown) giveUp();
        }, FAILSAFE_AFTER_START_MS);
        Promise.all([loadMotion(), fontsReady()])
          .then(async ([libs]) => {
            if (cancelled) return;
            const { buildMotion } = await import("./engine");
            if (cancelled) return;
            clearTimeout(failsafe);
            const shown = root.classList.contains("motion-off");
            teardown = buildMotion(libs, { entrances: !shown });
          })
          .catch(giveUp);
      },
      { delay: START_DELAY_MS, now: hiddenInView },
    );

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      cancelWait();
      document.removeEventListener("visibilitychange", onVisibility);
      teardown?.();
    };
  }, [pathname]);

  return null;
}

/** Fonts settle before lines are split or triggers measured; never wait long. */
function fontsReady(): Promise<unknown> {
  const ready = document.fonts?.ready ?? Promise.resolve();
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, 1000))]);
}
