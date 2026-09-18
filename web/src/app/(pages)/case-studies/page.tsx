import type { Metadata } from "next";
import React from "react";
import { caseStudies, caseStudiesIntro, type CaseStudy } from "@content/caseStudies";

export const metadata: Metadata = {
  title: "Case studies",
  description: caseStudiesIntro.standfirst,
};

/**
 * The cases in full: the files, what was wrong, and — where it was captured —
 * the engine's own output, quoted rather than paraphrased.
 *
 * This page is wider than the other inner routes because the argument in each
 * case is a comparison, and a comparison squeezed into one column stops being
 * one. Each case is anchored by slug so the homepage strip can link into it.
 */

function Panel({
  heading,
  note,
  children,
  tone = "neutral",
}: {
  heading: string;
  note: string;
  children: React.ReactNode;
  tone?: "neutral" | "flag";
}) {
  return (
    <div
      className={`feature-card feature-card--${tone === "flag" ? "magenta" : "teal"} p-6 sm:p-8`}
    >
      <h3 className="font-display text-display-md font-semibold text-primary">{heading}</h3>
      <p className="mt-2 text-sm text-muted">{note}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function UnitList({ units }: { units: NonNullable<CaseStudy["declared"]["units"]> }) {
  return (
    <ol className="space-y-2.5">
      {units.map((unit, index) => (
        <li
          key={unit.name}
          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
            unit.present
              ? "border-hairline bg-white/[0.03]"
              : "border-dashed border-[rgba(236,0,140,0.55)] bg-[rgba(236,0,140,0.08)]"
          }`}
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
  );
}

function Lines({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-3">
      {lines.map((line) => (
        <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Case({ study }: { study: CaseStudy }) {
  const who = study.client ?? study.clientFallback;

  return (
    <article
      id={study.slug}
      className="scroll-mt-24 border-t border-hairline py-[clamp(56px,7vw,104px)] first:border-t-0 first:pt-0"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        {study.errorClass}
      </p>
      <h2 className="mt-5 max-w-3xl font-display text-display-xl font-bold text-primary text-balance">
        {study.title}
      </h2>
      <p className="mt-6 max-w-2xl text-body-lg text-muted">{study.standfirst}</p>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-6 sm:grid-cols-4">
        {study.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {fact.label}
            </dt>
            <dd className="mt-1.5 font-mono text-sm text-primary">{fact.value}</dd>
          </div>
        ))}
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            Customer
          </dt>
          <dd className="mt-1.5 text-sm text-muted">{who}</dd>
        </div>
      </dl>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Panel heading={study.declared.heading} note={study.declared.note}>
          {study.declared.units ? (
            <UnitList units={study.declared.units} />
          ) : (
            <Lines lines={study.declared.lines ?? []} />
          )}
        </Panel>

        <Panel heading={study.found.heading} note={study.found.note} tone="flag">
          {study.declared.units ? (
            <>
              {/* Six pages present, the seventh slot left open. */}
              <ol className="grid grid-cols-4 gap-3">
                {Array.from({ length: study.declared.units.length }, (_, index) => {
                  const present = index < study.declared.units!.filter((u) => u.present).length;
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
                        className={`h-1 rounded-full ${
                          present ? "bg-white/15" : "bg-[rgba(236,0,140,0.5)]"
                        }`}
                      />
                    </li>
                  );
                })}
              </ol>
              <p className="mt-6 text-body-lg text-muted">{study.consequence}</p>
            </>
          ) : (
            <Lines lines={study.found.lines ?? []} />
          )}
        </Panel>
      </div>

      {study.output ? (
        <div className="ui-frame mt-8 overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              What the tool reported
            </span>
            <span className="ml-auto rounded-full border border-accent-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
              {study.output.certainty}
            </span>
          </div>
          <div className="px-5 py-5">
            <p className="font-mono text-sm leading-relaxed text-primary">
              {study.output.summary}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["Expected", study.output.expected],
                ["Found", study.output.foundLine],
                ["Where", study.output.location],
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
      ) : null}

      {!study.declared.units ? (
        <p className="mt-8 max-w-3xl text-body-lg text-muted">{study.consequence}</p>
      ) : null}

      <ul className="mt-8 flex flex-wrap gap-2">
        {study.checks.map((check) => (
          <li
            key={check}
            className="rounded-full border border-hairline bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
          >
            {check}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <ul className="flex flex-wrap gap-2">
        {["Product", "Business Solution"].map((item) => (
          <li
            key={item}
            className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
          >
            {item}
          </li>
        ))}
      </ul>
      <h1 className="mt-6 max-w-3xl font-display text-display-lg font-bold text-primary text-balance">
        {caseStudiesIntro.heading}
      </h1>
      <p className="mt-5 max-w-2xl text-body-lg text-muted">{caseStudiesIntro.standfirst}</p>

      <div className="mt-16">
        {caseStudies.map((study) => (
          <Case key={study.slug} study={study} />
        ))}
      </div>

      {/* Stating the limits is the point, not a disclaimer. A buyer weighing a
          verification tool trusts the vendor who draws its own boundary. */}
      <p className="mt-12 max-w-3xl border-l-2 border-accent-line pl-5 text-body-lg text-muted">
        The tool approves nothing and rejects nothing. It reads the files, reports what it
        finds, and says how certain it is. Colour accuracy, trap and overprint intent, and
        anything that needs a person&apos;s judgement stay with the person.
      </p>
    </div>
  );
}
