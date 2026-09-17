import React from "react";
import Section from "./Section";
import { home } from "@content/home";

export default function Founder() {
  const copy = home.founder;

  return (
    <Section labelledBy="founder-heading" padding="compact" width="narrow">
      <div>
        <h2
          id="founder-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p className="mt-10 font-display text-display-md font-semibold text-primary">{copy.name}</p>
        <p className="mt-2 text-sm text-muted">{copy.role}</p>
        <p className="mt-6 text-body-lg text-muted">{copy.description}</p>
      </div>
    </Section>
  );
}
