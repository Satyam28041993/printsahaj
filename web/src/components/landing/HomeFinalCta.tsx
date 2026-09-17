"use client";

import React from "react";
import CtaButton from "./CtaButton";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/**
 * The closing section, built as a destination rather than a card.
 *
 * A rounded panel here would read as one more card in a page that has already
 * shown four of them, and the eye skims it. Letting the type run at full width
 * over a grid floor makes the page arrive somewhere instead of just ending.
 */
export default function HomeFinalCta() {
  const copy = home.finalCta;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 85%" });

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden px-5 py-[clamp(96px,14vw,200px)] sm:px-8"
    >
      {/* Floor first, then the glow that lifts the type off it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] cta-floor"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(760px 300px at 50% 42%, var(--accent-glow), transparent 68%)",
        }}
      />

      <div ref={revealRef} className="relative mx-auto max-w-4xl text-center">
        <h2
          data-reveal
          id="final-cta-heading"
          className="font-display text-display-xl font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mx-auto mt-7 max-w-xl text-body-lg text-muted">
          {copy.supporting}
        </p>
        <div
          data-reveal
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <CtaButton href={copy.primaryCta.href} size="lg">
            {copy.primaryCta.label}
          </CtaButton>
          <CtaButton href={copy.secondaryCta.href} size="lg" variant="ghost">
            {copy.secondaryCta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
