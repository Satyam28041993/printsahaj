"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutTimeline() {
  const copy = about.founder;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%", stagger: 0.08 });

  return (
    <AboutSection labelledBy="about-career-heading">
      <div ref={revealRef} className="max-w-[46rem]">
        <h2 data-reveal id="about-career-heading" className="font-display text-display-md font-bold text-primary">
          {copy.timelineHeading}
        </h2>
        <ol className="about-timeline">
          {copy.timeline.map((item) => (
            <li key={`${item.period}-${item.role}`} data-reveal className="about-timeline__item">
              <p className="about-timeline__date">{item.period}</p>
              <p className="about-timeline__role">
                {item.role}
                {item.current ? <span className="about-timeline__now">Now</span> : null}
              </p>
              <p className="about-timeline__org">{item.org}</p>
              <p className="about-timeline__desc">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </AboutSection>
  );
}
