"use client";

import React from "react";
import ShowcaseMedia from "@/components/landing/ShowcaseMedia";
import { solutions } from "@content/solutions";
import { LABEL_RATE_DEFAULTS, labelRatePerThousand } from "@/lib/labelRate";
import { useReveal } from "@/lib/useReveal";
import type { ShowcaseSlug } from "@/data/showcase";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/**
 * Printing experience as proof, not a limit. Real screens only.
 * The costing figure uses the same formula as the public calculator.
 */
export default function SolutionsPrint() {
  const { print } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-print-heading" className="sol-print">
      <div className="sol-print__inner">
        <div className="sol-print__lead">
          <div className="sol-print__copy">
            <h2 id="solutions-print-heading" data-reveal className="sol-print__title" style={beat(0)}>
              {print.title}
            </h2>
            <div data-reveal className="sol-print__support" style={beat(1)}>
              {print.supporting.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <article className="sol-proof" data-reveal style={beat(3)}>
            <h3 className="sol-proof__name">{print.primary.name}</h3>
            <ShowcaseMedia slug={print.primary.slug as ShowcaseSlug} title={print.primary.screen} collage="showcase" />
            <p className="sol-proof__line">{print.primary.line}</p>
            <a className="sol-link" href={print.primary.href}>
              {print.primary.link}
            </a>
          </article>
        </div>

        <ul className="sol-print__more">
          {print.secondary.map((item, index) =>
            "slug" in item ? (
              <li
                key={item.name}
                className={item.slug === "printverify" ? "sol-proof sol-proof--verify" : "sol-proof"}
                data-reveal
                style={beat(index + 4)}
              >
                <h3 className="sol-proof__name">{item.name}</h3>
                <ShowcaseMedia
                  slug={item.slug as ShowcaseSlug}
                  title={item.screen}
                  collage="showcase"
                  flat={item.slug === "printverify"}
                />
                <p className="sol-proof__line">{item.line}</p>
                <a className="sol-link" href={item.href}>
                  {item.link}
                </a>
              </li>
            ) : null,
          )}
        </ul>
        {print.secondary.map((item) =>
          "slug" in item ? null : (
            <div key={item.name} className="sol-print__cost" data-reveal style={beat(7)}>
              <Costing label={item.resultLabel} />
              <div>
                <h3 className="sol-proof__name">{item.name}</h3>
                <p className="sol-proof__line">{item.line}</p>
                <a className="sol-link" href={item.href}>
                  {item.link}
                </a>
              </div>
            </div>
          ),
        )}

        <p data-reveal className="sol-print__statement" style={beat(8)}>
          {print.statement.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Costing({ label }: { label: string }) {
  const rate = labelRatePerThousand(LABEL_RATE_DEFAULTS);
  const money = rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="sol-cost">
      <p className="sol-cost__value">₹ {money}</p>
      <p className="sol-cost__label">{label}</p>
    </div>
  );
}
