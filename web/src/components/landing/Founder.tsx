import React from "react";
import FounderMark from "./visuals/FounderMark";
import { home } from "@content/home";

export default function Founder() {
  const copy = home.founder;

  return (
    <section aria-labelledby="founder-heading" className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <FounderMark />
        <div>
          <h2 id="founder-heading" className="font-display text-display-lg font-bold text-primary">
            {copy.heading}
          </h2>
          <p className="mt-10 font-display text-display-md font-semibold text-primary">{copy.name}</p>
          <p className="mt-2 text-sm text-muted">{copy.role}</p>
          <p className="mt-6 max-w-xl text-body-lg text-muted">{copy.description}</p>
        </div>
      </div>
    </section>
  );
}
