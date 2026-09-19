"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutCvLists() {
  const copy = about.founder;
  const expertiseRef = useReveal<HTMLDivElement>({ start: "top 88%" });
  const eduRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <>
      <AboutSection labelledBy="about-expertise-heading" className="about-section--quiet">
        <div ref={expertiseRef} className="max-w-4xl">
          <h2
            data-reveal
            id="about-expertise-heading"
            className="font-display text-display-md font-bold text-primary"
          >
            {copy.expertiseHeading}
          </h2>
          <ul data-reveal className="about-expertise">
            {copy.expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </AboutSection>

      <AboutSection labelledBy="about-education-heading">
        <div ref={eduRef} className="about-cv-split">
          <div>
            <h2
              data-reveal
              id="about-education-heading"
              className="font-display text-display-md font-bold text-primary"
            >
              {copy.educationHeading}
            </h2>
            <ul data-reveal className="about-cv-list">
              {copy.education.map((item) => (
                <li key={item.qualification}>
                  <p className="about-cv-list__title">{item.qualification}</p>
                  <p className="about-cv-list__meta">{item.period}</p>
                  <p className="about-cv-list__meta">{item.institute}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2
              data-reveal
              id="about-languages-heading"
              className="font-display text-display-md font-bold text-primary"
            >
              {copy.languagesHeading}
            </h2>
            <ul data-reveal className="about-cv-list">
              {copy.languages.map((item) => (
                <li key={item.name}>
                  <p className="about-cv-list__title">{item.name}</p>
                  <p className="about-cv-list__meta">{item.level}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AboutSection>
    </>
  );
}
