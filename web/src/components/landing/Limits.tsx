"use client";

import React from "react";
import Section from "./Section";
import { useReveal } from "@/lib/useReveal";
import { limits } from "@content/limits";

/**
 * Deliberately the quietest block on the page: no card, no border, no accent
 * colour, narrow measure. The restraint is the message.
 */
export default function Limits() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section labelledBy="limits-heading" width="narrow">
      <div ref={ref}>
        <h2
          data-reveal
          id="limits-heading"
          className="font-display text-display-md font-semibold text-muted"
        >
          {limits.heading}
        </h2>

        <div className="mt-10 space-y-7">
          {limits.paragraphs.map((paragraph) => (
            <p key={paragraph} data-reveal className="text-body-lg text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}
