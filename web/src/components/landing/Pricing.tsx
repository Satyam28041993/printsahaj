"use client";

import React from "react";
import Section from "./Section";
import CtaButton from "./CtaButton";
import { useReveal } from "@/lib/useReveal";
import { pricing } from "@content/pricing";

/**
 * Cost anchoring. The left panel is deliberately flat and muted — it is the
 * status quo — and only the right panel carries the working colour.
 */
export default function Pricing() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="pricing" labelledBy="pricing-heading">
      <div ref={ref}>
        <h2
          data-reveal
          id="pricing-heading"
          className="max-w-2xl font-display text-display-lg font-bold text-primary"
        >
          {pricing.heading}
        </h2>

        <div className="mt-[clamp(40px,5vw,72px)] grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <div
            data-reveal
            className="rounded-2xl border border-hairline bg-surface p-7 sm:p-8"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {pricing.current.kicker}
            </p>
            <dl className="mt-7 divide-y divide-[var(--border)]">
              {pricing.current.lines.map((line) => (
                <div
                  key={line.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                >
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="font-mono text-mono text-faint">{line.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            data-reveal
            aria-hidden="true"
            className="flex items-center justify-center lg:px-2"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              versus
            </span>
          </div>

          <div
            data-reveal
            className="rounded-2xl border p-7 sm:p-8"
            style={{
              borderColor: "var(--accent-line)",
              background: "var(--accent-weak)",
            }}
          >
            <p className="font-display text-title font-semibold text-primary">
              {pricing.product.name}
            </p>
            <p className="mt-2 font-display text-display-md font-bold text-[var(--accent)]">
              {pricing.product.price}
            </p>

            <ul className="mt-7 space-y-3.5">
              {pricing.product.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-muted">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-[var(--accent)]"
                  >
                    <path
                      d="M3.5 8.4l3 3 6-6.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <CtaButton
              href={pricing.product.cta.href}
              size="lg"
              className="mt-8 w-full justify-center"
            >
              {pricing.product.cta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
