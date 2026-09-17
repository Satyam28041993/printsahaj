"use client";

import React from "react";
import Link from "next/link";
import ProductVisual from "./visuals/ProductVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/** Work as scenes. Tints alternate so two entries never read as one block. */

const TINTS = ["violet", "teal"] as const;

export default function SelectedWork() {
  const copy = home.selectedWork;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });
  const items = copy.items.filter((item) => item.public);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="work-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <h2 data-reveal id="work-heading" className="font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <ul className="mt-12 space-y-6">
          {items.map((item, index) => {
            const visual =
              item.name === "PrintVerify" || item.name === "Flexora" ? (
                <ProductVisual name={item.name} size="lg" />
              ) : null;
            const body = (
              <div
                className={`feature-card feature-card--${TINTS[index % TINTS.length]} grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {visual}
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    {item.category}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-display-md font-semibold text-primary">{item.name}</h3>
                    {item.status ? (
                      <span className="rounded-full border border-[var(--tint-line)] bg-[var(--tint-weak)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tint-ink)]">
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="mt-4 text-body-lg text-muted">{item.description}</p>
                  ) : null}
                  {item.url ? (
                    <p className="mt-6 text-sm text-[var(--tint-ink)]">
                      Explore{" "}
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
            );

            return (
              <li key={item.name} data-reveal>
                {item.url ? (
                  <Link href={item.url} className="group block">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
