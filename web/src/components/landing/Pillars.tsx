import React from "react";
import PillarScene, { PILLAR_SCENES } from "./visuals/PillarScene";
import { home } from "@content/home";

/**
 * The four things PrintSahaj builds, as four tinted cards.
 *
 * Each card carries its own hue and its own piece of product UI, so the
 * section reads as four distinct offers rather than one repeated card shape.
 * The copy is untouched — only its arrangement changed.
 */

const TINTS = ["teal", "violet", "cyan", "magenta"] as const;

const CHIP_ICONS = [
  // Software: connected records.
  <path
    key="software"
    d="M5 5h5v5H5zM10 10h5v5h-5z"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
  />,
  // AI: one input, several routed steps.
  <path
    key="ai"
    d="M4 10h3m0 0c2 0 2-4 4-4h5m-9 4c2 0 2 4 4 4h5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
  />,
  // Growth: a narrowing funnel.
  <path
    key="growth"
    d="M4 5h12l-4 5v5l-4-2v-3L4 5z"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinejoin="round"
  />,
  // Products: an instrument scale.
  <path
    key="products"
    d="M4 12h12M6 12V8m4 4V6m4 6V9"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
  />,
];

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="var(--tint-line)" strokeWidth="1.2" />
      <path
        d="M5 8.2l2 2L11 6"
        fill="none"
        stroke="var(--tint-ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pillars() {
  const { heading, items } = home.pillars;

  return (
    <section
      aria-labelledby="pillars-heading"
      className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="pillars-heading" className="font-display text-display-lg font-bold text-primary">
          {heading}
        </h2>

        <div className="mt-12 space-y-6">
          {items.map((pillar, index) => (
            <article
              key={pillar.name}
              className={`feature-card feature-card--${TINTS[index % TINTS.length]}`}
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-10">
                <div className="p-6 pb-2 sm:p-9 sm:pb-3 lg:py-11">
                  <span className="feature-chip">
                    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                      {CHIP_ICONS[index % CHIP_ICONS.length]}
                    </svg>
                  </span>

                  <h3 className="mt-5 font-display text-display-md font-semibold text-primary">
                    {pillar.name}
                  </h3>
                  <p className="mt-3.5 max-w-xl text-body-lg text-muted">{pillar.description}</p>

                  <ul className="mt-6 space-y-2.5">
                    {pillar.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2.5 text-sm text-primary/85">
                        <Tick />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The scene is cropped on purpose: a panel that runs past the
                    card edge reads as a real screen, not a boxed illustration.
                    On a phone it sits under the copy, cropped by the bottom
                    edge instead of the right one. */}
                <div className="px-6 sm:px-9 lg:px-0 lg:pl-6 lg:pt-9">
                  <PillarScene id={PILLAR_SCENES[index] ?? "software"} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
