import React from "react";
import CtaButton from "./CtaButton";
import HeroOrb from "./visuals/HeroOrb";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="hero-split hero-fit">
      <div className="hero-fit__inner relative mx-auto grid w-full max-w-[1360px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
        <div className="hero-fit__copy">
          <p className="story-kicker">{hero.eyebrow}</p>
          <h1 id="hero-heading" className="hero-fit__title mt-5 text-balance font-display font-bold text-primary">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-[46ch] text-body-lg text-muted">{hero.supporting}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
