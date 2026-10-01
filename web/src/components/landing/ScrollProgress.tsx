import React from "react";

/**
 * 3px brand-gradient bar. Its scaleX is driven by a scrubbed ScrollTrigger
 * (data-m="progress", see lib/motion/engine.ts): no React state, no scroll
 * listener. Without the motion layer it simply stays empty.
 */
export default function ScrollProgress() {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <span data-m="progress" />
    </div>
  );
}
