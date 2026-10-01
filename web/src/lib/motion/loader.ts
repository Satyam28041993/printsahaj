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
 * Calls `run` once the page has painted and gone idle, or sooner on the first
 * scroll / pointerdown / key press. Returns a cancel function.
 */
export function whenIdle(run: () => void, timeout = 1200): () => void {
  let done = false;
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

  const fire = () => {
    if (done) return;
    done = true;
    cleanup();
    run();
  };
  const cleanup = () => {
    events.forEach((name) => window.removeEventListener(name, fire));
    if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    if (timer) clearTimeout(timer);
  };

  events.forEach((name) => window.addEventListener(name, fire, { passive: true, once: true }));
  if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(fire, { timeout });
  else timer = setTimeout(fire, timeout);

  return () => {
    done = true;
    cleanup();
  };
}
