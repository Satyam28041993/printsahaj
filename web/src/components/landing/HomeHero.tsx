import React from "react";
import CtaButton from "./CtaButton";
import HeroSystem from "./visuals/HeroSystem";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="hero-split">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-[clamp(112px,14vw,160px)] sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pb-28">
        <div>
          <p className="story-kicker">{hero.eyebrow}</p>
          <h1
            id="hero-heading"
            className="mt-6 max-w-[14ch] text-balance font-display text-display-xl font-bold text-primary"
          >
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted">{hero.supporting}</p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
    </section>
  );
}
