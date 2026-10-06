"use client";

import React from "react";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";
import SolutionsFigure from "./SolutionsFigure";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/** One problem at a time. The photograph stays a labelled frame until it exists. */
export default function SolutionsStartSmall() {
  const { start } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-start-heading" className="sol-start">
      <div className="sol-start__grid">
        <div className="sol-start__copy">
          <h2 id="solutions-start-heading" data-reveal className="sol-start__title" style={beat(0)}>
            {start.title}
          </h2>
          <div data-reveal className="sol-start__lines" style={beat(1)}>
            {start.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <ol className="sol-steps">
            {start.steps.map((step, index) => (
              <li key={step} data-reveal style={beat(index + 2)}>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="sol-start__figure" data-reveal style={beat(4)}>
          <SolutionsFigure
            alt={start.figure.alt}
            label={start.figure.label}
            src={start.figure.src}
            width={start.figure.width}
            height={start.figure.height}
            place="start"
          />
        </div>
      </div>
    </section>
  );
}
