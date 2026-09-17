import React from "react";
import CtaButton from "./CtaButton";
import HeroSystem from "./visuals/HeroSystem";
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
        className="pointer-events-none absolute left-[18%] top-[-220px] h-[720px] w-[720px] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[20%] h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--violet-weak) 0%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-8 pt-[clamp(112px,14vw,168px)] sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:pb-4">
        <div>
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

        <HeroSystem />
      </div>

      <div className="relative mx-auto flex max-w-6xl justify-center px-5 pb-10 sm:px-8" aria-hidden="true">
        <div className="flex flex-col items-center">
          <span className="h-10 w-px bg-gradient-to-b from-accent-line to-transparent" />
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
