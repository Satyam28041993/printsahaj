import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ShowcaseMedia from "./ShowcaseMedia";
import { caseStudies, caseStudiesIntro } from "@content/caseStudies";

/**
 * PrintVerify proof as an investigation, not a card grid.
 * The varnish job is the only case with a captured engine output — it leads.
 */
export default function CaseStudy() {
  const lead = caseStudies[0];
  const rest = caseStudies.slice(1);
  if (!lead) return null;

  return (
    <section aria-labelledby="case-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p data-m="reveal" className="story-kicker">
          {caseStudiesIntro.eyebrow}
        </p>
        <p data-m="reveal" className="eco-badge mt-3">
          From real production experience
        </p>
        <h2
          data-m="lines"
          id="case-heading"
          className="mt-5 max-w-3xl font-display text-display-lg font-bold text-primary text-balance"
        >
          {lead.title}
        </h2>
        <p data-m="reveal" className="mt-5 max-w-2xl text-body-lg text-muted">
          {lead.standfirst}
        </p>
        <p data-m="reveal" className="mt-2 text-sm text-faint">
          Representative job, details anonymised.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="evidence-sheet p-6 sm:p-8" data-m="parallax" data-m-speed="3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Declared units</p>
            {lead.declared.units ? (
              <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" data-m="plates">
                {lead.declared.units.map((unit) => (
                  <li
                    key={unit.name}
                    className={`plate-chip ${unit.present ? "" : "is-missing"}`}
                  >
                    <span
                      className="plate-chip__swatch"
                      style={{ background: unit.swatch ?? "transparent" }}
                    />
                    <span>{unit.name}</span>
                    {unit.present ? null : <span className="plate-chip__miss">Missing</span>}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6">
              <p>
                <span className="evidence-figure m-num text-primary" data-m="counter">7</span>
                <span className="mt-2 block text-sm text-muted">units declared</span>
              </p>
              <p>
                <span className="evidence-figure m-num text-primary" data-m="counter">6</span>
                <span className="mt-2 block text-sm text-muted">plates found</span>
              </p>
              <p>
                <span className="mt-2 block font-display text-xl font-semibold text-accent sm:text-2xl">Varnish missing</span>
              </p>
            </div>
            <ShowcaseMedia slug="printverify" title="PrintVerify check of the varnish-plate job" className="mt-8" />
          </div>

          <div className="evidence-sheet p-6 sm:p-8" data-m="parallax" data-m-speed="-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{lead.errorClass}</p>
            {lead.output ? (
              <blockquote className="mt-6 border-l border-accent-line pl-4 font-mono text-sm leading-relaxed text-primary">
                {lead.output.summary}
              </blockquote>
            ) : null}
            <dl className="mt-8 space-y-3">
              {lead.facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-4 border-b border-hairline pb-3 text-sm">
                  <dt className="text-faint">{fact.label}</dt>
                  <dd className="text-right text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-muted">{lead.consequence}</p>
          </div>
        </div>

        {rest.length > 0 ? (
          <ol data-m="reveal" className="mt-16 grid gap-8 lg:grid-cols-2">
            {rest.map((study) => (
              <li key={study.slug} data-m-child data-m-card className="border-t border-hairline pt-6">
                <Link href={`${caseStudiesIntro.cta.href}#${study.slug}`} className="group block">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{study.errorClass}</p>
                  <h3 className="mt-3 font-display text-title font-semibold text-primary">{study.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{study.teaser}</p>
                  <p className="mt-4 text-sm text-faint">
                    Read it
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      {" →"}
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        ) : null}

        <div data-m="reveal" className="mt-10">
          <CtaButton href={caseStudiesIntro.cta.href} variant="ghost">
            {caseStudiesIntro.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
