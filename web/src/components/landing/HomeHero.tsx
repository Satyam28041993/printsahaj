import React from "react";
import Pill from "./Pill";
import SpotPanel from "./SpotPanel";
import Marquee from "./Marquee";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** The words that get the gradient sweep. They are part of the headline copy. */
const SWEEP = "working systems";

/**
 * The headline, one span per word. The word stagger is pure CSS so the H1 is
 * painted at the first frame (it is the LCP element) and never waits for JS.
 */
function HeadlineWords({ text }: { text: string }) {
  const words = text.split(" ");
  const at = text.indexOf(SWEEP);
  const sweepFrom = at < 0 ? -1 : text.slice(0, at).split(" ").length - 1;
  const sweepTo = at < 0 ? -1 : sweepFrom + SWEEP.split(" ").length - 1;
  return (
    <>
      {words.map((word, i) => {
        const sweep = i >= sweepFrom && i <= sweepTo;
        return (
          <React.Fragment key={`${word}-${i}`}>
            {i ? " " : null}
            <span
              className={`h-word${sweep ? " h-sweep" : ""}`}
              style={{ "--w": i, "--s": sweep ? i - sweepFrom : 0 } as React.CSSProperties}
            >
              {word}
            </span>
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * S1 — the hero: one centred statement inside a large rounded panel. Copy is
 * the existing hero copy. The entrance is CSS (no JS needed); on scroll the
 * panel shrinks and rounds away (data-m="scrub-out").
 */
export default function HomeHero() {
  const { hero, pillars } = home;
  const { callCta } = printSahajSite.nav;

  return (
    <section id="top" aria-labelledby="hero-heading" className="home-hero h-wrap" data-m="scrub-out">
      <SpotPanel data-m-panel>
        <div className="mx-auto flex max-w-[1040px] flex-col items-center px-5 pb-4 pt-6 text-center sm:px-8 sm:pb-8 sm:pt-16 lg:pt-20" data-m-content>
          <p className="h-chip h-rise" style={rise(0)}>
            <span className="h-chip__dot" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-heading" className="h-title h-title--xl h-hero-title mt-4 max-w-[19ch] sm:mt-7 sm:max-w-none">
            <HeadlineWords text={hero.headline} />
          </h1>
          <p className="h-lead h-rise h-rise--solid mt-3 max-w-[52ch] sm:mt-6" style={rise(2)}>
            {hero.supporting}
          </p>
          <div className="h-rise h-rise--solid mt-5 flex w-full flex-col items-stretch gap-2.5 sm:mt-9 sm:w-auto sm:flex-row sm:items-center" style={rise(3)}>
            <Pill href={hero.primaryCta.href}>{hero.primaryCta.label}</Pill>
            <Pill href={callCta.href} variant="ghost" call ariaLabel={`${callCta.label}: ${callCta.number}`}>
              {callCta.label}
            </Pill>
          </div>
          <p className="h-rise h-rise--solid mt-3 max-w-[62ch] text-[13px] leading-snug text-faint sm:mt-7 sm:text-sm" style={rise(4)}>
            {hero.trustLine}
          </p>
        </div>
        <div className="h-rise pb-4 pt-0 sm:pb-7 sm:pt-3" style={rise(5)}>
          <Marquee items={pillars.items.map((item) => item.name)} label={hero.specialization} />
        </div>
      </SpotPanel>
    </section>
  );
}
