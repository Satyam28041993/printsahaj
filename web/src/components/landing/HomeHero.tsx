import React from "react";
import CtaButton from "./CtaButton";
import HeroOrb from "./visuals/HeroOrb";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="hero-split">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-[clamp(112px,14vw,148px)] sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:pb-24">
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
            <CtaButton href="/crm/" size="lg" variant="ghost">
              See the CRM
            </CtaButton>
          </div>
        </div>
        <div className="lg:order-first">
          <HeroOrb src={hero.visual.src} alt={hero.visual.alt} />
        </div>
      </div>
    </section>
  );
}
