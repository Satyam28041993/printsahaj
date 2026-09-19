"use client";

import React from "react";
import FunnelJourney from "./visuals/FunnelJourney";
import PillarScene from "./visuals/PillarScene";
import ToolVisual from "./visuals/ToolVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";
import { tools } from "@content/tools";

/**
 * Four pillars, four compositions. Same claims as before — different visual
 * treatment so they read as one ecosystem, not a repeated card.
 */
export default function Pillars() {
  const { heading, supporting, items } = home.pillars;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 78%" });
  const [software, ai, growth, products] = items;
  const liveTools = tools.items.filter((item) => item.category === "Calculator");

  return (
    <section aria-labelledby="pillars-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-7xl">
        <h2 id="pillars-heading" className="font-display text-display-lg font-bold text-primary">
          {heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{supporting}</p>

        <div className="mt-16 space-y-[clamp(64px,8vw,120px)]">
          {software ? (
            <article data-reveal className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <p className="story-kicker">01</p>
                <h3 className="mt-4 font-display text-display-md font-semibold text-primary">{software.name}</h3>
                <p className="mt-4 max-w-xl text-body-lg text-muted">{software.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-primary/85">
                  {software.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div className="min-h-[22rem] overflow-hidden border border-hairline bg-sunken">
                <PillarScene id="software" />
              </div>
            </article>
          ) : null}

          {ai ? (
            <article data-reveal className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="min-h-[20rem] overflow-hidden border border-hairline bg-sunken lg:order-1">
                <PillarScene id="ai" />
              </div>
              <div className="lg:order-2">
                <p className="story-kicker">02</p>
                <h3 className="mt-4 font-display text-display-md font-semibold text-primary">{ai.name}</h3>
                <p className="mt-4 max-w-xl text-body-lg text-muted">{ai.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-primary/85">
                  {ai.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </article>
          ) : null}

          {growth ? (
            <article data-reveal>
              <p className="story-kicker">03</p>
              <h3 className="mt-4 font-display text-display-md font-semibold text-primary">{growth.name}</h3>
              <p className="mt-4 max-w-2xl text-body-lg text-muted">{growth.description}</p>
              <p className="mt-3 font-display text-title font-medium text-primary">
                {home.digitalGrowth.emphasis}
              </p>
              <div className="mt-10 border border-hairline bg-elevated p-5 sm:p-8">
                <FunnelJourney stages={home.digitalGrowth.funnel} capabilities={home.digitalGrowth.capabilities} />
              </div>
            </article>
          ) : null}

          {products ? (
            <article data-reveal>
              <p className="story-kicker">04</p>
              <h3 className="mt-4 font-display text-display-md font-semibold text-primary">{products.name}</h3>
              <p className="mt-4 max-w-2xl text-body-lg text-muted">{products.description}</p>
              <ul className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
                {liveTools.slice(0, 3).map((tool) => (
                  <li key={tool.name} className="min-w-[16rem] snap-start lg:min-w-0">
                    <ToolVisual kind={tool.visual} />
                    <p className="mt-3 text-sm font-medium text-primary">{tool.name}</p>
                    <p className="mt-1 text-sm text-muted">{tool.summary}</p>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
