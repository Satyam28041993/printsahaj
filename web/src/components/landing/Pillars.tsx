import React from "react";
import Section from "./Section";
import InView from "./visuals/InView";
import PillarMotif, { PILLAR_MOTIFS } from "./visuals/PillarMotif";
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
        <InView className="stagger-in mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((pillar, index) => (
            <article
              key={pillar.name}
              className="group surface-card relative rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <PillarMotif id={PILLAR_MOTIFS[index] ?? "software"} />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </p>
              </div>
              <h3 className="mt-6 font-display text-title font-semibold text-primary">
                {pillar.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.description}</p>
              <span
                aria-hidden="true"
                className="mt-5 inline-flex translate-y-1 text-accent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              >
                →
              </span>
            </article>
          ))}
        </InView>
      </div>
    </Section>
  );
}
