import React from "react";
import Section from "./Section";
import { home } from "@content/home";

export default function Pillars() {
  const { heading, items } = home.pillars;

  return (
    <Section labelledBy="pillars-heading" padding="compact">
      <div>
        <h2
          id="pillars-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {heading}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((pillar, index) => (
            <li
              key={pillar.name}
              className="surface-card rounded-2xl p-6 sm:p-8"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-title font-semibold text-primary">
                {pillar.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
