"use client";

import React from "react";
import ProcessFlow from "./visuals/ProcessFlow";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/**
 * The statement section: one large centred claim, then the three principles
 * as separate beats rather than one run-on line, then the process visual.
 *
 * Centring earns its place here because this is the only section on the page
 * that is a statement rather than a list — the change of alignment is what
 * tells a reader they have arrived somewhere different.
 */
export default function WhatIsPrintSahaj() {
  const copy = home.whatIsPrintSahaj;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section
      aria-labelledby="what-heading"
      className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8"
    >
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            data-reveal
            id="what-heading"
            className="font-display text-display-xl font-bold text-primary text-balance"
          >
            {copy.heading}
          </h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} data-reveal className="mx-auto mt-6 max-w-2xl text-body-lg text-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Three principles, read as three — the diamond is a separator, not
            decoration, and it disappears on a phone where they stack. */}
        <ul className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-0">
          {copy.principleLines.map((line, index) => (
            <li key={line} data-reveal className="flex items-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-5 hidden text-sm text-accent/70 sm:inline"
                >
                  ✦
                </span>
              )}
              <span className="font-display text-title font-medium text-primary">{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <ProcessFlow />
        </div>
      </div>
    </section>
  );
}
