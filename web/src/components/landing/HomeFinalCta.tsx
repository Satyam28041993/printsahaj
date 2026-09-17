import React from "react";
import Section from "./Section";
import CtaButton from "./CtaButton";
import { home } from "@content/home";

export default function HomeFinalCta() {
  const copy = home.finalCta;

  return (
    <Section labelledBy="final-cta-heading" width="narrow" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />
      <div className="relative text-center">
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
    </Section>
  );
}
