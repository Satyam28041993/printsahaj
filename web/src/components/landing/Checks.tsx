"use client";

import React from "react";
import Section from "./Section";
import { useReveal } from "@/lib/useReveal";
import { checks } from "@content/checks";

/**
 * The three checkpoints, as cards that stack under the nav as you scroll — the
 * later step settles on top of the earlier one, which is the order they happen in.
 * Sticky behaviour is desktop-only; on a phone they simply stack in flow.
 */
export default function Checks() {
  const ref = useReveal<HTMLDivElement>({ selector: "[data-reveal]", start: "top 85%" });

  return (
    <Section id="how-it-works" labelledBy="checks-heading" width="wide">
      <div ref={ref}>
        <h2
          data-reveal
          id="checks-heading"
          className="max-w-3xl font-display text-display-lg font-bold text-primary"
        >
          {checks.heading}
        </h2>

        <ol className="mt-[clamp(48px,6vw,80px)] space-y-6 md:space-y-10">
          {checks.steps.map((step, i) => (
            <li
              key={step.number}
              className="md:sticky md:top-[88px]"
              style={{ zIndex: i + 1 }}
            >
              <article className="overflow-hidden rounded-2xl border border-hairline bg-elevated">
                {/* The output column is given the wider share — its longest line
                    is fixed-width monospace and must not need a scrollbar. */}
                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:p-10">
                  <div>
                    <span className="font-mono text-sm font-medium text-[var(--accent)]">
                      {step.number}
                    </span>
                    <h3 className="mt-4 font-display text-display-md font-semibold text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-body-lg text-muted">{step.timing}</p>

                    <ul className="mt-7 space-y-3">
                      {step.items.map((item) => (
                        <li key={item} className="flex gap-3 text-muted">
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-px w-4 shrink-0 bg-[var(--accent-line)]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="output-panel overflow-x-auto rounded-xl p-5 sm:p-6">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      Sample output
                    </p>
                    <pre className="font-mono text-mono whitespace-pre text-muted">
                      {step.output}
                    </pre>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
