import React from "react";
import PrintWorkflow from "./visuals/PrintWorkflow";
import { home } from "@content/home";

export default function Specialization() {
  const copy = home.specialization;

  return (
    <section aria-labelledby="specialization-heading" className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 id="specialization-heading" className="font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <div className="mt-12">
          <PrintWorkflow />
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {copy.topics.map((topic) => (
            <li key={topic} className="border-t border-hairline pt-3 text-sm text-primary">
              {topic}
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-body-lg text-muted">{copy.closing}</p>
      </div>
    </section>
  );
}
