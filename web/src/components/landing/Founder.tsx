import React from "react";
import Section from "./Section";
import FounderMark from "./visuals/FounderMark";
import { home } from "@content/home";

export default function Founder() {
  const copy = home.founder;

  return (
    <Section labelledBy="founder-heading" padding="compact">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <FounderMark />
        <div>
          <h2
            id="founder-heading"
            className="font-display text-display-lg font-bold text-primary"
          >
            {copy.heading}
          </h2>
          <p className="mt-10 font-display text-display-md font-semibold text-primary">{copy.name}</p>
          <p className="mt-2 text-sm text-muted">{copy.role}</p>
          <p className="mt-6 max-w-xl text-body-lg text-muted">{copy.description}</p>
        </div>
      </div>
    </Section>
  );
}
