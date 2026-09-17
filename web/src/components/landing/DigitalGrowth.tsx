"use client";

import React from "react";
import FunnelJourney from "./visuals/FunnelJourney";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/**
 * Marketing as one path, not a grid of services. The funnel gets a tinted
 * field of its own so the eight stages read as a single journey.
 */

export default function DigitalGrowth() {
  const copy = home.digitalGrowth;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section aria-labelledby="growth-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <h2 data-reveal id="growth-heading" className="max-w-3xl font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <p data-reveal className="mt-4 font-display text-title font-medium text-primary">
          {copy.emphasis}
        </p>
        <div data-reveal className="feature-card feature-card--cyan mt-12 p-6 sm:p-10">
          <FunnelJourney stages={copy.funnel} capabilities={copy.capabilities} />
        </div>
      </div>
    </section>
  );
}
