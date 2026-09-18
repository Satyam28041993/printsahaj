"use client";

import React from "react";
import CtaButton from "@/components/landing/CtaButton";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutCta() {
  const copy = about.cta;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <AboutSection labelledBy="about-cta-heading" className="about-section--cta">
      <div ref={revealRef} className="max-w-[40rem]">
        <h2
          data-reveal
          id="about-cta-heading"
          className="font-display text-display-lg font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-6 text-body-lg leading-relaxed text-muted">
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
    </AboutSection>
  );
}
