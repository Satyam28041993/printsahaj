"use client";

import React from "react";
import CtaButton from "./CtaButton";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

export default function HomeFinalCta() {
  const copy = home.finalCta;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 85%" });

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="band-sunken relative px-5 py-[clamp(96px,14vw,180px)] sm:px-8"
    >
      <div ref={revealRef} className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div data-reveal className="cta-spine" aria-hidden="true">
          {copy.flow.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <div>
          <h2
            data-reveal
            id="final-cta-heading"
            className="max-w-[16ch] font-display text-display-xl font-bold text-primary text-balance"
          >
            {copy.heading}
          </h2>
          <p data-reveal className="mt-7 max-w-xl text-body-lg text-muted">
            {copy.supporting}
          </p>
          <div data-reveal className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <CtaButton href={copy.primaryCta.href} size="lg">
              {copy.primaryCta.label}
            </CtaButton>
            <CtaButton href={copy.secondaryCta.href} size="lg" variant="ghost">
              {copy.secondaryCta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
