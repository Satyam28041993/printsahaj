"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutHero() {
  const copy = about.company;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <AboutSection labelledBy="about-company-heading">
      <div ref={revealRef}>
        <div className="max-w-[46rem]">
          <p data-reveal className="story-kicker">
            {copy.eyebrow}
          </p>
          <h1
            data-reveal
            id="about-company-heading"
            className="mt-6 font-display text-display-lg font-bold text-primary text-balance"
          >
            {copy.headline}
          </h1>
          <p data-reveal className="mt-8 text-body-lg leading-relaxed text-muted">
            {copy.supporting}
          </p>
          <p data-reveal className="mt-8 font-display text-title font-medium text-primary">
            {copy.philosophy}
          </p>
        </div>

        <ol data-reveal className="about-process" aria-label="How PrintSahaj works">
          {copy.process.map((step, index) => (
            <li key={step.label} className="about-process__step">
              <span className="about-process__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="about-process__label">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </AboutSection>
  );
}
