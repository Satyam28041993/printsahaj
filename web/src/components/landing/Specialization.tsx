"use client";

import React from "react";
import PrintWorkflow from "./visuals/PrintWorkflow";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/**
 * The specialization section keeps its process spine and turns the domain
 * list into chips — twelve bare rules read as a table of contents, which is
 * not what a list of things you know should look like.
 */

export default function Specialization() {
  const copy = home.specialization;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section aria-labelledby="specialization-heading" className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <h2 data-reveal id="specialization-heading" className="font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <div data-reveal className="mt-12">
          <PrintWorkflow />
        </div>
        <ul data-reveal className="mt-12 flex flex-wrap gap-2.5">
          {copy.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-hairline bg-white/[0.03] px-3.5 py-1.5 text-sm text-primary transition-colors duration-300 hover:border-accent-line hover:bg-[var(--accent-weak)]"
            >
              {topic}
            </li>
          ))}
        </ul>
        <p data-reveal className="mt-10 max-w-2xl text-body-lg text-muted">{copy.closing}</p>
      </div>
    </section>
  );
}
