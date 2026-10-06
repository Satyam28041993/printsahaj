"use client";

import React from "react";
import ShowcaseMedia from "@/components/landing/ShowcaseMedia";
import SolutionsFigure from "@/components/solutions/SolutionsFigure";
import { homeShowcase } from "@content/homeShowcase";
import { solutions } from "@content/solutions";
import { LABEL_RATE_DEFAULTS, labelRatePerThousand } from "@/lib/labelRate";
import { useReveal } from "@/lib/useReveal";
import type { ShowcaseSlug } from "@/data/showcase";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/**
 * Five situations, not five packages. Copy stays in the page. Real product
 * screens are the only pictures; photographic slots stay empty until a
 * photograph exists.
 */
export default function SolutionsAreas() {
  const { areas } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section
      ref={revealRef}
      id={areas.id}
      aria-labelledby="solutions-areas-heading"
      className="sol-areas band-sunken"
    >
      <div className="sol-areas__inner">
        <header className="sol-areas__intro">
          <h2 id="solutions-areas-heading" data-reveal className="sol-areas__title font-display text-display-lg font-bold text-primary text-balance">
            {areas.title}
          </h2>
          <p data-reveal className="sol-areas__support" style={beat(1)}>
            {areas.supporting.map((line) => (
              <span key={line} className="sol-areas__line">
                {line}
              </span>
            ))}
          </p>
        </header>

        <article className="sol-area sol-area--automation" aria-labelledby="area-automation">
          <AreaCopy
            id="area-automation"
            number={areas.automation.number}
            kicker={areas.automation.kicker}
            lines={areas.automation.lines}
            body={areas.automation.body}
            examples={areas.automation.examples}
          />
          <div className="sol-area__visual" data-reveal style={beat(4)}>
            <FlowList steps={areas.automation.flow} />
          </div>
        </article>

        <article className="sol-area sol-area--ai" aria-labelledby="area-ai">
          <AreaCopy
            id="area-ai"
            number={areas.ai.number}
            kicker={areas.ai.kicker}
            lines={areas.ai.lines}
            body={areas.ai.body}
            examples={areas.ai.examples}
          />
          <div className="sol-area__visual sol-ai" data-reveal style={beat(4)}>
            <SolutionsFigure
              alt={areas.ai.figure.alt}
              label={areas.ai.figure.label}
              src={areas.ai.figure.src}
              width={areas.ai.figure.width}
              height={areas.ai.figure.height}
              place="ai"
            />
          </div>
        </article>

        <article className="sol-area sol-area--software" aria-labelledby="area-software">
          <AreaCopy
            id="area-software"
            number={areas.software.number}
            kicker={areas.software.kicker}
            lines={areas.software.lines}
            body={areas.software.body}
            examples={areas.software.examples}
          />
          <div className="sol-area__visual">
            <ul className="sol-screens">
              {areas.software.screens.map((screen, index) => (
                <li key={screen.slug} className="sol-screens__item" data-reveal style={beat(index)}>
                  <ShowcaseMedia slug={screen.slug as ShowcaseSlug} title={screen.title} />
                  <a className="sol-areas__link" href={screen.href}>
                    {screen.link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="sol-area sol-area--flow" aria-labelledby="area-workflows">
          <AreaCopy
            id="area-workflows"
            number={areas.workflows.number}
            kicker={areas.workflows.kicker}
            lines={areas.workflows.lines}
            body={areas.workflows.body}
            examples={areas.workflows.examples}
          />
          <div className="sol-area__visual" data-reveal style={beat(4)}>
            <FlowList steps={areas.workflows.flow} tall />
          </div>
        </article>

        <article className="sol-area sol-area--tools" aria-labelledby="area-tools">
          <AreaCopy
            id="area-tools"
            number={areas.tools.number}
            kicker={areas.tools.kicker}
            lines={areas.tools.lines}
            body={areas.tools.body}
            examples={areas.tools.examples}
          />
          <div className="sol-area__visual" data-reveal style={beat(4)}>
            <LabelRate />
            <a className="sol-areas__link" href={areas.tools.link.href}>
              {areas.tools.link.label}
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

function AreaCopy({
  id,
  number,
  kicker,
  lines,
  body,
  examples,
}: {
  id: string;
  number: string;
  kicker: string;
  lines: readonly string[];
  body: readonly string[];
  examples: readonly string[];
}) {
  return (
    <div className="sol-area__copy">
      <p data-reveal className="sol-area__kicker" style={beat(0)}>
        <span>{number}</span>
        {kicker}
      </p>
      <h3 id={id} data-reveal className="sol-area__title" style={beat(1)}>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h3>
      <div data-reveal className="sol-area__body" style={beat(2)}>
        {body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <ul data-reveal className="sol-tags" style={beat(3)}>
        {examples.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>
    </div>
  );
}

function FlowList({ steps, tall = false }: { steps: readonly string[]; tall?: boolean }) {
  return (
    <ol className={tall ? "sol-path sol-path--tall" : "sol-path"}>
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

function LabelRate() {
  const { calculator } = homeShowcase;
  const rate = labelRatePerThousand(LABEL_RATE_DEFAULTS);
  const money = rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="sol-rate">
      <p className="sol-rate__title">{calculator.title}</p>
      <dl className="sol-rate__fields">
        {calculator.fields.map((field) => (
          <div key={field.key}>
            <dt>{field.label}</dt>
            <dd>
              {LABEL_RATE_DEFAULTS[field.key]}
              <span>{field.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="sol-rate__result">
        <span>{calculator.resultLabel}</span>
        <strong>₹ {money}</strong>
      </p>
      <p className="sol-rate__note">{calculator.note}</p>
    </div>
  );
}
