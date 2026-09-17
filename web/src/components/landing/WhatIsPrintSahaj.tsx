import React from "react";
import ProcessFlow from "./visuals/ProcessFlow";
import { home } from "@content/home";

export default function WhatIsPrintSahaj() {
  const copy = home.whatIsPrintSahaj;

  return (
    <section aria-labelledby="what-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h2 id="what-heading" className="font-display text-display-lg font-bold text-primary">
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
        <div className="mt-14">
          <ProcessFlow />
        </div>
      </div>
    </section>
  );
}
