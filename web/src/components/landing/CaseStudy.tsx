"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { caseStudy } from "@content/caseStudy";

/**
 * The proof section.
 *
 * Every other section on this page describes what PrintSahaj can do. This one
 * shows a thing it did, on a real job, with the engine's own words. It sits
 * directly after the products because a claim is worth reading only next to
 * the evidence for it.
 *
 * The two columns are the whole argument: seven declared against six found.
 * The missing seventh is drawn as an empty slot rather than described, because
 * the gap is the story and a reader should see it before they read anything.
 */
export default function CaseStudy() {
  const copy = caseStudy;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });
  const who = copy.client ?? copy.clientFallback;

  return (
    <section
      aria-labelledby="case-heading"
      className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8"
    >
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <p
          data-reveal
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
        >
          {copy.eyebrow}
        </p>
        <h2
          data-reveal
          id="case-heading"
          className="mt-5 max-w-3xl font-display text-display-xl font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-6 max-w-2xl text-body-lg text-muted">
          {copy.standfirst}
        </p>

        {/* Job identity, in the units the trade uses. */}
        <dl
          data-reveal
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-6 sm:grid-cols-4"
        >
          {copy.job.map((row) => (
            <div key={row.label}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {row.label}
              </dt>
              <dd className="mt-1.5 font-mono text-sm text-primary">{row.value}</dd>
            </div>
          ))}
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              Customer
            </dt>
            <dd className="mt-1.5 text-sm text-muted">{who}</dd>
          </div>
        </dl>

        {/* Seven against six. */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div data-reveal className="feature-card feature-card--teal p-6 sm:p-8">
            <h3 className="font-display text-display-md font-semibold text-primary">
              {copy.declared.heading}
            </h3>
            <p className="mt-2 text-sm text-muted">{copy.declared.note}</p>
            <ol className="mt-6 space-y-2.5">
              {copy.declared.units.map((unit, index) => (
                <li
                  key={unit.name}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                    unit.present
                      ? "border-hairline bg-white/[0.03]"
                      : "border-dashed border-[var(--miss-line)] bg-[var(--miss-weak)]"
                  }`}
                  style={
                    unit.present
                      ? undefined
                      : ({
                          "--miss-line": "rgba(236, 0, 140, 0.55)",
                          "--miss-weak": "rgba(236, 0, 140, 0.08)",
                        } as React.CSSProperties)
                  }
                >
                  <span className="w-5 shrink-0 font-mono text-[10px] text-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {unit.swatch ? (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-[3px] border border-white/15"
                      style={{ background: unit.swatch }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-[3px] border border-dashed border-white/25"
                    />
                  )}
                  <span className="text-sm text-primary">{unit.name}</span>
                  {!unit.present && (
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-[#f472b6]">
                      no plate
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="feature-card feature-card--magenta p-6 sm:p-8">
            <h3 className="font-display text-display-md font-semibold text-primary">
              {copy.found.heading}
            </h3>
            <p className="mt-2 text-sm text-muted">{copy.found.note}</p>

            {/* Six pages present, the seventh slot left open. */}
            <ol className="mt-6 grid grid-cols-4 gap-3">
              {Array.from({ length: 7 }, (_, index) => {
                const present = index < 6;
                return (
                  <li
                    key={index}
                    className={`flex aspect-[3/4] flex-col justify-between rounded-lg border p-2 ${
                      present
                        ? "border-hairline bg-white/[0.04]"
                        : "border-dashed border-[rgba(236,0,140,0.55)] bg-[rgba(236,0,140,0.07)]"
                    }`}
                  >
                    <span className="font-mono text-[9px] text-faint">
                      {present ? `p${index + 1}` : "—"}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-1 rounded-full ${present ? "bg-white/15" : "bg-[rgba(236,0,140,0.5)]"}`}
                    />
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 text-body-lg text-muted">{copy.consequence}</p>
          </div>
        </div>

        {/* The engine's own words, not a paraphrase of them. */}
        <div data-reveal className="ui-frame mt-8 overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              {copy.output.heading}
            </span>
            <span className="ml-auto rounded-full border border-accent-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
              {copy.output.certainty}
            </span>
          </div>
          <div className="px-5 py-5">
            <p className="font-mono text-sm leading-relaxed text-primary">
              {copy.output.summary}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["Expected", copy.output.expected],
                ["Found", copy.output.foundLine],
                ["Where", copy.output.location],
              ].map(([term, value]) => (
                <div key={term} className="border-t border-hairline pt-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                    {term}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Saying what it did not do is the point, not a disclaimer. */}
        <p data-reveal className="mt-8 max-w-3xl border-l-2 border-accent-line pl-5 text-body-lg text-muted">
          {copy.notDecided}
        </p>
      </div>
    </section>
  );
}
