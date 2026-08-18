"use client";

import React from "react";
import Section from "./Section";
import { useReveal } from "@/lib/useReveal";
import { audience } from "@content/audience";

export default function Audience() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section labelledBy="audience-heading">
      <div ref={ref}>
        <h2
          data-reveal
          id="audience-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {audience.heading}
        </h2>

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audience.cards.map((card) => (
            <article
              key={card.role}
              data-reveal
              className="surface-card rounded-xl p-6"
            >
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
                {card.role}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {card.benefit}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
