import React from "react";
import CtaButton from "./CtaButton";
import { home } from "@content/home";

export default function HomeFinalCta() {
  const copy = home.finalCta;

  return (
    <section aria-labelledby="final-cta-heading" className="relative overflow-hidden px-5 py-[clamp(48px,7vw,80px)] sm:px-8">
      <div className="cinematic-panel mx-auto max-w-6xl rounded-[2rem] px-6 py-20 text-center sm:px-16 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-registration-marks opacity-40" />
        <div className="relative">
          <h2 id="final-cta-heading" className="font-display text-display-xl font-bold text-primary">
            {copy.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-muted">{copy.supporting}</p>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
