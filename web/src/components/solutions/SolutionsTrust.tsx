"use client";

import React from "react";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/**
 * A typographic pause after the situations. The gap before "...and that's okay."
 * is the pause; motion only fades each line in. Nothing here is a service.
 */
export default function SolutionsTrust() {
  const { trust } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-trust-heading" className="sol-trust">
      <div className="sol-trust__inner">
        <h2 id="solutions-trust-heading" data-reveal className="sol-trust__title" style={beat(0)}>
          {trust.title}
        </h2>
        <div data-reveal className="sol-trust__support" style={beat(1)}>
          {trust.supporting.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p data-reveal className="sol-trust__turn" style={beat(3)}>
          {trust.turn}
        </p>
        <p data-reveal className="sol-trust__okay" style={beat(9)}>
          {trust.okay}
        </p>
        <p data-reveal className="sol-trust__close" style={beat(12)}>
          {trust.close.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
