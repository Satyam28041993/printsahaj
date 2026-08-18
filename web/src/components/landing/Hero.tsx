import React from "react";
import CtaButton from "./CtaButton";
import PlateRegister from "./PlateRegister";
import { hero } from "@content/hero";

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Registration-mark grid, faded out toward the fold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-registration-marks grid-fade"
      />
      {/* One soft teal glow, behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[900px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-[clamp(72px,9vw,140px)] pt-[clamp(128px,15vw,190px)] sm:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          />
          {hero.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="mt-7 font-display text-display-xl font-bold text-primary"
        >
          {hero.headlineLines[0]}
          <br />
          <span className="text-muted">{hero.headlineLines[1]}</span>
        </h1>

        <p className="mt-7 max-w-2xl text-body-lg text-muted">{hero.sub}</p>

        <div className="mt-9">
          <CtaButton href={hero.cta.href} size="lg">
            {hero.cta.label}
          </CtaButton>
          <p className="mt-4 text-sm text-faint">{hero.ctaNote}</p>
        </div>

        <div className="mt-[clamp(56px,7vw,96px)]">
          <PlateRegister />
        </div>
      </div>
    </section>
  );
}
