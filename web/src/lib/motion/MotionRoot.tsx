"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadMotion, whenIdle } from "./loader";
import { MEDIA } from "./tokens";

const GSAP_TIMEOUT_MS = 8000;

/**
 * Mounted once per page that uses data-m hooks. Loads GSAP after first paint
 * (idle, or the first scroll / pointerdown), then builds every animation the
 * page declared. Renders nothing.
 *
 * Reduced motion gets no motion contexts at all: GSAP is not even downloaded.
 * `motion-ready` is set only once the library has arrived, so the inline
 * failsafe in layout.tsx (load + 1.5s) still applies on a slow network: it drops
 * every hidden pre-state (`motion-off`) and the late library then skips the
 * entrance builders. A failed import does the same (giveUp).
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia(MEDIA.reduce).matches || !root.classList.contains("js-motion")) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;
    const giveUp = () => {
      root.classList.add("motion-off");
      root.classList.remove("js-motion");
    };
    const hardStop = setTimeout(() => {
      if (!teardown) giveUp();
    }, GSAP_TIMEOUT_MS);

    const onVisibility = () => root.toggleAttribute("data-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const cancelIdle = whenIdle(() => {
      Promise.all([loadMotion(), fontsReady()])
        .then(async ([libs]) => {
          if (cancelled) return;
          const { buildMotion } = await import("./engine");
          if (cancelled) return;
          // Only now does the inline failsafe stand down. If it already fired
          // (motion-off), the page is shown: skip the entrances that would hide it again.
          const shown = root.classList.contains("motion-off");
          if (!shown) root.classList.add("motion-ready");
          teardown = buildMotion(libs, { entrances: !shown });
        })
        .catch(giveUp);
    });

    return () => {
      cancelled = true;
      clearTimeout(hardStop);
      cancelIdle();
      document.removeEventListener("visibilitychange", onVisibility);
      teardown?.();
    };
  }, [pathname]);

  return null;
}

/** Fonts settle before lines are split or triggers measured; never wait long. */
function fontsReady(): Promise<unknown> {
  const ready = document.fonts?.ready ?? Promise.resolve();
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, 2000))]);
}
