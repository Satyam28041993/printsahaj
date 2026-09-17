"use client";

import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ToolVisual from "./visuals/ToolVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";
import { tools } from "@content/tools";

/**
 * The tools rail: a row you push sideways, not another stack of cards.
 *
 * A rail is the right shape here because these are instruments a person
 * reaches for one at a time, and because the page has had two stacked card
 * formats by this point and needs a change of gesture.
 */

const TINTS = ["teal", "cyan", "violet", "magenta"] as const;

export default function SelectedTools() {
  const copy = home.toolsTeaser;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 82%" });

  return (
    <section
      aria-labelledby="tools-heading"
      className="band-elevated relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8"
    >
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2
              data-reveal
              id="tools-heading"
              className="font-display text-display-lg font-bold text-primary"
            >
              {copy.heading}
            </h2>
            <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">
              {copy.supporting}
            </p>
          </div>
          <div data-reveal>
            <CtaButton href={copy.cta.href} variant="ghost">
              {copy.cta.label}
            </CtaButton>
          </div>
        </div>

        <ul className="work-rail mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {tools.items.map((item, index) => (
            <li
              key={item.href}
              data-reveal
              className="w-[min(100%,19rem)] shrink-0 snap-start"
            >
              <Link
                href={item.href}
                className={`feature-card feature-card--${TINTS[index % TINTS.length]} group block h-full`}
              >
                <div className="p-4 pb-0">
                  <ToolVisual kind={item.visual} />
                </div>
                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--tint-ink)]">
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-primary">
                    {item.name}
                  </h3>
                  <p className="mt-4 text-sm text-[var(--tint-ink)]">
                    Open{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
