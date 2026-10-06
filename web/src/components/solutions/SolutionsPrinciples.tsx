"use client";

import React from "react";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/** Three principles, set as type. No cards and no photograph. */
export default function SolutionsPrinciples() {
  const { principles } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-principles-heading" className="sol-principles">
      <div className="sol-principles__inner">
        <h2 id="solutions-principles-heading" data-reveal className="sol-principles__title" style={beat(0)}>
          {principles.title}
        </h2>
        <p data-reveal className="sol-principles__support" style={beat(1)}>
          {principles.supporting}
        </p>
        <ol className="sol-principles__list">
          {principles.items.map((item, index) => (
            <li key={item.number} className="sol-principle" data-reveal style={beat(index + 3)}>
              <p className="sol-principle__num">{item.number}</p>
              <h3 className="sol-principle__name">{item.title}</h3>
              <div className="sol-principle__body">
                {item.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
