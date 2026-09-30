import React from "react";
import Pill from "./Pill";
import SpotPanel from "./SpotPanel";
import Marquee from "./Marquee";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * S1 — the hero: one centred statement inside a large rounded panel. Copy is
 * the existing hero copy; the staggered fade-up is CSS, so it needs no JS.
 */
export default function HomeHero() {
  const { hero, pillars } = home;
  const { callCta } = printSahajSite.nav;

  return (
    <section id="top" aria-labelledby="hero-heading" className="home-hero h-wrap">
      <SpotPanel>
        <div className="mx-auto flex max-w-[1040px] flex-col items-center px-5 pb-8 pt-12 text-center sm:px-8 sm:pt-16 lg:pt-20">
          <p className="h-chip h-rise" style={rise(0)}>
            <span className="h-chip__dot" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-heading" className="h-title h-title--xl h-rise mt-7 max-w-[19ch] sm:max-w-none" style={rise(1)}>
            {hero.headline}
          </h1>
          <p className="h-lead h-rise mt-6 max-w-[52ch]" style={rise(2)}>
            {hero.supporting}
          </p>
          <div className="h-rise mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center" style={rise(3)}>
            <Pill href={hero.primaryCta.href}>{hero.primaryCta.label}</Pill>
            <Pill href={callCta.href} variant="ghost" call ariaLabel={`${callCta.label}: ${callCta.number}`}>
              {callCta.label}
            </Pill>
          </div>
          <p className="h-rise mt-7 max-w-[62ch] text-sm text-faint" style={rise(4)}>
            {hero.trustLine}
          </p>
        </div>
        <div className="h-rise pb-7 pt-3" style={rise(5)}>
          <Marquee items={pillars.items.map((item) => item.name)} label={hero.specialization} />
        </div>
      </SpotPanel>
    </section>
  );
}
