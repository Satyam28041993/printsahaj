"use client";

import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import { useReveal } from "@/lib/useReveal";
import { caseStudies, caseStudiesIntro } from "@content/caseStudies";

/**
 * The proof strip.
 *
 * Every other section on this page says what PrintSahaj can do. This one
 * points at things it has done. It stays deliberately short: three lines and
 * a link, because the homepage's job is to prove the claim is not empty, and
 * the case studies page's job is to satisfy the person who now wants detail.
 *
 * The heading on each card is the class of error, not the job. A buyer scans
 * for "can it catch the kind of thing that bites me", and one job's name
 * answers that for nobody.
 */

const TINTS = ["teal", "violet", "magenta"] as const;

export default function CaseStudy() {
  const revealRef = useReveal<HTMLDivElement>({ start: "top 82%" });

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
          {caseStudiesIntro.eyebrow}
        </p>
        <h2
          data-reveal
          id="case-heading"
          className="mt-5 max-w-3xl font-display text-display-lg font-bold text-primary text-balance"
        >
          {caseStudiesIntro.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">
          {caseStudiesIntro.standfirst}
        </p>

        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {caseStudies.map((study, index) => (
            <li key={study.slug} data-reveal>
              <Link
                href={`${caseStudiesIntro.cta.href}#${study.slug}`}
                className={`feature-card feature-card--${TINTS[index % TINTS.length]} group flex h-full flex-col p-6 sm:p-7`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tint-ink)]">
                  {study.errorClass}
                </span>
                <h3 className="mt-4 font-display text-display-md font-semibold text-primary">
                  {study.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{study.teaser}</p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {study.checks.map((check) => (
                    <li
                      key={check}
                      className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint"
                    >
                      {check}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 pt-2 text-sm text-[var(--tint-ink)]">
                  Read it{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ol>

        <div data-reveal className="mt-10">
          <CtaButton href={caseStudiesIntro.cta.href} variant="ghost">
            {caseStudiesIntro.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
