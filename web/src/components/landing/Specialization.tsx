import React from "react";
import Section from "./Section";
import { home } from "@content/home";

export default function Specialization() {
  const copy = home.specialization;

  return (
    <Section labelledBy="specialization-heading" padding="compact">
      <div>
        <h2
          id="specialization-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {copy.topics.map((topic) => (
            <li key={topic} className="border-t border-hairline pt-3 text-sm text-primary">
              {topic}
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-body-lg text-muted">{copy.closing}</p>
      </div>
    </Section>
  );
}
