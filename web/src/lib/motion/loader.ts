/**
 * Lazy GSAP loader. GSAP, ScrollTrigger and SplitText are imported only after
 * first paint, so they never sit on the critical path for LCP.
 */

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextType } from "gsap/SplitText";

export interface MotionLibs {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
}

let libs: MotionLibs | null = null;
let pending: Promise<MotionLibs> | null = null;

/** The libraries if they have already loaded, else null. Never triggers a load. */
export function getMotion(): MotionLibs | null {
  return libs;
}

/** Imports and registers GSAP + plugins once. Safe to call repeatedly. */
export function loadMotion(): Promise<MotionLibs> {
  if (libs) return Promise.resolve(libs);
  if (!pending) {
    pending = Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(
      ([core, st, split]) => {
        const gsap = core.gsap;
        gsap.registerPlugin(st.ScrollTrigger, split.SplitText);
        st.ScrollTrigger.config({ ignoreMobileResize: true });
        libs = { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: split.SplitText };
        return libs;
      },
    );
  }
  return pending;
}

/**
 * Calls `run` once, at the first of:
 *  - the first scroll / pointerdown / key press / touchstart (the visitor is about
 *    to see below-the-fold content, so the library is wanted now);
 *  - `delay` ms after the window `load` event (a visitor who just reads the hero
 *    pays nothing for motion that is not on screen yet);
 *  - the next idle moment, if `now` (content that is hidden until the library
 *    arrives is already in view).
 * Returns a cancel function.
 */
export function whenWanted(run: () => void, { delay, now }: { delay: number; now: boolean }): () => void {
  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let idleId: number | undefined;
  const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

  const cleanup = () => {
    events.forEach((name) => window.removeEventListener(name, fire));
    window.removeEventListener("load", onLoad);
    if (timer) clearTimeout(timer);
    if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
  };
  function fire() {
    if (done) return;
    done = true;
    cleanup();
    run();
  }
  function onLoad() {
    timer = setTimeout(fire, delay);
  }

  events.forEach((name) => window.addEventListener(name, fire, { passive: true, once: true }));
  if (now) {
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(fire, { timeout: 1200 });
    else timer = setTimeout(fire, 1200);
  } else if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  return () => {
    done = true;
    cleanup();
  };
}
