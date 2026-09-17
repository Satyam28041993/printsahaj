"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Section from "./Section";
import ProductVisual from "./visuals/ProductVisual";
import { home } from "@content/home";

export default function SelectedWork() {
  const copy = home.selectedWork;
  const items = copy.items.filter((item) => item.public);
  const railRef = useRef<HTMLUListElement>(null);

  if (items.length === 0) return null;

  const scrollByCard = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.min(rail.clientWidth * 0.85, 420);
    rail.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <Section labelledBy="work-heading" padding="compact" width="wide">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="work-heading"
              className="font-display text-display-lg font-bold text-primary"
            >
              {copy.heading}
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Show previous work"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-accent-line hover:text-primary"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Show next work"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-accent-line hover:text-primary"
            >
              →
            </button>
          </div>
        </div>

        <ul
          ref={railRef}
          className="work-rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {items.map((item) => {
            const inner = (
              <>
                {item.name === "PrintVerify" || item.name === "Flexora" ? (
                  <ProductVisual name={item.name} />
                ) : null}
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {item.category}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-title font-semibold text-primary">{item.name}</h3>
                  {item.status ? (
                    <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {item.status}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>
                ) : null}
                {item.url ? (
                  <p className="mt-5 text-sm text-accent">
                    Explore <span aria-hidden="true">→</span>
                  </p>
                ) : null}
              </>
            );

            return (
              <li
                key={item.name}
                className="w-[min(100%,22rem)] shrink-0 snap-start sm:w-[26rem]"
              >
                {item.url ? (
                  <Link href={item.url} className="surface-card block h-full rounded-2xl p-5 sm:p-6">
                    {inner}
                  </Link>
                ) : (
                  <div className="surface-card h-full rounded-2xl p-5 sm:p-6">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
