import React from "react";
import PillarMotif, { PILLAR_MOTIFS } from "./visuals/PillarMotif";
import { home } from "@content/home";

export default function Pillars() {
  const { heading, items } = home.pillars;

  return (
    <section aria-labelledby="pillars-heading" className="relative">
      <div className="mx-auto max-w-6xl px-5 pt-[clamp(72px,8vw,120px)] sm:px-8">
        <h2 id="pillars-heading" className="font-display text-display-lg font-bold text-primary">
          {heading}
        </h2>
      </div>
      <div className="mt-10 space-y-0">
        {items.map((pillar, index) => (
          <article
            key={pillar.name}
            className={`group px-5 py-12 sm:px-8 ${index % 2 === 0 ? "band-elevated" : "band-sunken"}`}
          >
            <div
              className={`mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="ui-frame flex min-h-[220px] items-center justify-center rounded-[1.75rem] p-10">
                <PillarMotif id={PILLAR_MOTIFS[index] ?? "software"} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-display-md font-semibold text-primary">
                  {pillar.name}
                </h3>
                <p className="mt-4 max-w-xl text-body-lg text-muted">{pillar.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
