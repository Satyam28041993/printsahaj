import React from "react";
import Section from "./Section";
import FunnelJourney from "./visuals/FunnelJourney";
import { home } from "@content/home";

export default function DigitalGrowth() {
  const copy = home.digitalGrowth;

  return (
    <Section labelledBy="growth-heading" padding="compact">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2
            id="growth-heading"
            className="font-display text-display-lg font-bold text-primary"
          >
            {copy.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
          <p className="mt-4 font-display text-title font-medium text-primary">{copy.emphasis}</p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {copy.capabilities.map((capability) => (
              <li key={capability}>
                <span className="capability-chip inline-flex min-h-10 items-center rounded-full px-3.5 py-2 text-sm text-muted">
                  {capability}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <FunnelJourney stages={copy.funnel} />
      </div>
    </Section>
  );
}
