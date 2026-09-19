"use client";

import React from "react";
import ProcessFlow from "./visuals/ProcessFlow";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

export default function BuildJourney() {
  const copy = home.journey;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 82%" });

  return (
    <section aria-labelledby="journey-heading" className="relative scroll-mt-28 px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-7xl">
        <p data-reveal className="story-kicker">
          {copy.kicker}
        </p>
        <h2
          data-reveal
          id="journey-heading"
          className="mt-6 max-w-3xl font-display text-display-lg font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>
        <div data-reveal className="mt-14">
          <ProcessFlow />
        </div>
      </div>
    </section>
  );
}
