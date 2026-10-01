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
 * If the library fails to arrive, `motion-off` drops every hidden pre-state so
 * the page stays complete.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia(MEDIA.reduce).matches || !root.classList.contains("js-motion")) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;
    // We own the hand-over from here: the inline failsafe stands down.
    root.classList.add("motion-ready");

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
          teardown = buildMotion(libs);
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
