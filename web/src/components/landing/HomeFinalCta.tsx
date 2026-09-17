import React from "react";
import Section from "./Section";
import CtaButton from "./CtaButton";
import { home } from "@content/home";

export default function HomeFinalCta() {
  const copy = home.finalCta;

  return (
    <Section labelledBy="final-cta-heading" className="overflow-hidden">
      <div className="cinematic-panel rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-registration-marks opacity-40"
        />
        <div className="relative">
          <h2
            id="final-cta-heading"
            className="font-display text-display-lg font-bold text-primary"
          >
            {copy.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-muted">{copy.supporting}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton href={copy.primaryCta.href} size="lg">
              {copy.primaryCta.label}
            </CtaButton>
            <CtaButton href={copy.secondaryCta.href} size="lg" variant="ghost">
              {copy.secondaryCta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
