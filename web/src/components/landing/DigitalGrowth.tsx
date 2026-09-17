import React from "react";
import FunnelJourney from "./visuals/FunnelJourney";
import { home } from "@content/home";

export default function DigitalGrowth() {
  const copy = home.digitalGrowth;

  return (
    <section aria-labelledby="growth-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 id="growth-heading" className="max-w-3xl font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <p className="mt-4 font-display text-title font-medium text-primary">{copy.emphasis}</p>
        <div className="mt-12">
          <FunnelJourney stages={copy.funnel} capabilities={copy.capabilities} />
        </div>
      </div>
    </section>
  );
}
