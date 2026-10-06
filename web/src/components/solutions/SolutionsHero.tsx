import React from "react";
import Pill from "@/components/landing/Pill";
import { solutions } from "@content/solutions";
import SolutionsFigure from "./SolutionsFigure";

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

const plain = (word: string) => word.replace(/[.“”]/g, "").replace(/\.$/, "");

/**
 * The H1, one span per word, same drop-in as the homepage hero. Words are
 * painted at the first frame (opacity stays 1) so the headline is not hidden
 * behind JS. On a phone the homepage CSS already turns the drop-in off.
 */
function HeroLines({ lines, sweepWords }: { lines: readonly string[]; sweepWords: string }) {
  const sweep = new Set(sweepWords.split(" ").map(plain));
  const rows: { word: string; i: number; on: boolean; s: number }[][] = [];
  let wordIndex = 0;
  let sweepFrom = 0;
  let sweepSeen = false;
  for (const line of lines) {
    const row: { word: string; i: number; on: boolean; s: number }[] = [];
    for (const word of line.split(" ")) {
      const on = sweep.has(plain(word));
      if (on && !sweepSeen) {
        sweepFrom = wordIndex;
        sweepSeen = true;
      }
      row.push({ word, i: wordIndex, on, s: on ? wordIndex - sweepFrom : 0 });
      wordIndex += 1;
    }
    rows.push(row);
  }

  return (
    <>
      {rows.map((row) => (
        <span key={row.map((item) => item.word).join(" ")} className="sol-hero__line">
          {row.map((item, indexInLine) => (
            <React.Fragment key={`${item.word}-${item.i}`}>
              {indexInLine ? " " : null}
              <span
                className={`h-word${item.on ? " h-sweep" : ""}`}
                style={{ "--w": item.i, "--s": item.s } as React.CSSProperties}
              >
                {item.word}
              </span>
            </React.Fragment>
          ))}
        </span>
      ))}
    </>
  );
}

export default function SolutionsHero() {
  const { hero } = solutions;

  return (
    <section aria-labelledby="solutions-hero-heading" className="sol-hero">
      <div className="sol-hero__grid">
        <div className="sol-hero__copy">
          <p className="h-kicker h-rise" style={rise(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="solutions-hero-heading" className="h-title h-title--xl h-hero-title sol-hero__title">
            <HeroLines lines={hero.lines} sweepWords={hero.sweepWords} />
          </h1>
          <p className="h-lead h-rise sol-hero__lead" style={rise(2)}>
            {hero.supporting}
          </p>
          <div className="sol-hero__actions h-rise h-rise--solid" style={rise(3)}>
            <Pill href={hero.primaryCta.href}>{hero.primaryCta.label}</Pill>
            <Pill href={hero.secondaryCta.href} variant="ghost">
              {hero.secondaryCta.label}
            </Pill>
          </div>
        </div>
        <SolutionsFigure alt={hero.figure.alt} label={hero.figure.label} />
      </div>
    </section>
  );
}
