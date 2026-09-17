import React from "react";
import CtaButton from "./CtaButton";
import HeroStudio from "./visuals/HeroStudio";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative min-h-[100svh] overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-registration-marks" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 20% 20%, var(--accent-glow), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, var(--violet-weak), transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 pb-12 pt-[clamp(108px,13vw,150px)] sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative z-10">
          <p className="text-sm font-medium tracking-wide text-muted">{hero.eyebrow}</p>
          <h1
            id="hero-heading"
            className="mt-6 max-w-xl font-display text-display-xl font-bold text-primary text-balance"
          >
            {hero.headline}
          </h1>
          <p className="mt-7 max-w-xl text-body-lg text-muted">{hero.supporting}</p>
          <p className="mt-4 max-w-xl text-sm text-faint">{hero.specialization}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </CtaButton>
            <CtaButton href={hero.secondaryCta.href} size="lg" variant="ghost">
              {hero.secondaryCta.label}
            </CtaButton>
          </div>
        </div>
        <HeroStudio />
      </div>
    </section>
  );
}
