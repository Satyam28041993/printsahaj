"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

const FRAGMENT_STYLE = [
  { top: "8%", left: "6%", tilt: "-7deg" },
  { top: "18%", left: "38%", tilt: "5deg" },
  { top: "36%", left: "10%", tilt: "3deg" },
  { top: "48%", left: "46%", tilt: "-4deg" },
  { top: "64%", left: "18%", tilt: "6deg" },
  { top: "78%", left: "40%", tilt: "-2deg" },
] as const;

/**
 * Editorial problem statement. Fragments on one side, a connected system on
 * the other — not a grid of equal cards.
 */
export default function WhatIsPrintSahaj() {
  const copy = home.problem;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section aria-labelledby="problem-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-7xl">
        <p data-reveal className="story-kicker">
          {copy.kicker}
        </p>
        <h2
          data-reveal
          id="problem-heading"
          className="mt-6 max-w-[18ch] font-display text-display-xl font-bold text-primary text-balance"
        >
          {copy.statement}
        </h2>
        <p data-reveal className="mt-6 max-w-[22ch] font-display text-display-lg font-medium text-primary text-balance">
          {copy.statementSecond}
        </p>
        <p data-reveal className="mt-6 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>

        <div data-reveal className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="fragment-board">
            {copy.fragments.map((fragment, index) => (
              <span
                key={fragment}
                className={`fragment-chip ${index % 2 === 1 ? "is-quiet" : ""}`}
                style={{ ...FRAGMENT_STYLE[index], ["--tilt" as string]: FRAGMENT_STYLE[index].tilt }}
              >
                {fragment}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-faint lg:text-left">
              ↓
            </p>
            <div className="connected-panel px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{copy.bridge}</p>
              <p className="mt-3 font-display text-display-md font-semibold text-primary">{copy.connected}</p>
              <p className="mt-2 text-sm text-muted">{copy.connectedHint}</p>
              <ol className="mt-6 space-y-2 border-t border-accent-line/40 pt-4">
                {home.hero.system.spine.slice(1).map((step) => (
                  <li key={step.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-primary">{step.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{step.hint}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
