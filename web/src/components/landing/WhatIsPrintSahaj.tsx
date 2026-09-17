import React from "react";
import Section from "./Section";
import ProcessFlow from "./visuals/ProcessFlow";
import InView from "./visuals/InView";
import { home } from "@content/home";

export default function WhatIsPrintSahaj() {
  const copy = home.whatIsPrintSahaj;

  return (
    <Section labelledBy="what-heading" padding="compact">
      <InView className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <h2
            id="what-heading"
            className="font-display text-display-lg font-bold text-primary"
          >
            {copy.heading}
          </h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-6 text-body-lg text-muted">
              {paragraph}
            </p>
          ))}
          <p className="mt-10 font-display text-title font-medium text-primary">
            {copy.principleLines.join(" ")}
          </p>
        </div>
        <ProcessFlow />
      </InView>
    </Section>
  );
}
