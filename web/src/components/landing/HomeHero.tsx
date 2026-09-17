import React from "react";
import CtaButton from "./CtaButton";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-registration-marks grid-fade"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[900px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-[clamp(72px,9vw,140px)] pt-[clamp(128px,16vw,200px)] sm:px-8">
        <p className="text-sm font-medium tracking-wide text-muted">{hero.eyebrow}</p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-4xl font-display text-display-xl font-bold text-primary text-balance"
        >
          {hero.headline}
        </h1>

        <p className="mt-7 max-w-2xl text-body-lg text-muted">{hero.supporting}</p>
        <p className="mt-4 max-w-2xl text-sm text-faint">{hero.specialization}</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton href={hero.primaryCta.href} size="lg">
            {hero.primaryCta.label}
          </CtaButton>
          <CtaButton href={hero.secondaryCta.href} size="lg" variant="ghost">
            {hero.secondaryCta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
