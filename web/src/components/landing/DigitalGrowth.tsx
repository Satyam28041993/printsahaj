import React from "react";
import Section from "./Section";
import { home } from "@content/home";

export default function DigitalGrowth() {
  const copy = home.digitalGrowth;

  return (
    <Section labelledBy="growth-heading" padding="compact">
      <div>
        <h2
          id="growth-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <p className="mt-4 font-display text-title font-medium text-primary">{copy.emphasis}</p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ol>
            {copy.funnel.map((step, index) => (
              <li key={step} className="flex flex-col">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline font-mono text-[10px] text-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-title font-medium text-primary">{step}</span>
                </div>
                {index < copy.funnel.length - 1 && (
                  <span aria-hidden="true" className="ml-[17px] h-5 w-px bg-hairline" />
                )}
              </li>
            ))}
          </ol>

          <ul className="flex flex-wrap content-start gap-2">
            {copy.capabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-full border border-hairline bg-surface px-3.5 py-2 text-sm text-muted"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
