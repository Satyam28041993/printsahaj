import React from "react";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

/** One line per official pillar. The philosophy appears here once. */
export default function Pillars() {
  const { items } = home.pillars;

  return (
    <section aria-labelledby="pillars-heading" className="band-sunken relative px-5 py-[clamp(64px,8vw,104px)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p data-m="reveal" className="max-w-xl font-display text-title text-primary">
          {printSahajSite.brand.philosophy}
        </p>
        <h2 id="pillars-heading" data-m="lines" className="mt-8 font-display text-display-md font-semibold text-primary">
          {home.pillars.heading}
        </h2>
        <ol data-m="reveal" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.name} data-m-child data-m-card className="border-t border-hairline pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-primary">{item.name}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
