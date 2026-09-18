import React from "react";
import { GlowButton } from "./HeroButtons";
import { results, type ResultTone } from "@content/showcase";

function ToneIcon({ tone }: { tone: ResultTone }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (tone === "ok") {
    return (
      <svg {...common}>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    );
  }
  if (tone === "warn") {
    return (
      <svg {...common}>
        <path d="M12 4l9 16H3L12 4z" />
        <path d="M12 10v4M12 17.5v.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const TONE_WORD: Record<ResultTone, string> = {
  ok: "Nothing wrong found",
  warn: "Look at it yourself",
  bad: "Files disagree",
};

export default function ResultsPanel() {
  return (
    <section className="dots-section" aria-labelledby="results-heading">
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
        <p className="hero-eyebrow">{results.eyebrow}</p>
        <h2 id="results-heading" className="section-title mt-5 text-balance text-4xl sm:text-5xl">
          {results.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-muted">{results.supporting}</p>

        <ul className="mt-10 space-y-4">
          {results.rows.map((row) => (
            <li key={row.label} className={`result-row result-row--${row.tone}`}>
              <span className="result-row__icon">
                <ToneIcon tone={row.tone} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">
                  {row.label}
                  <span className="sr-only"> — {TONE_WORD[row.tone]}</span>
                </p>
                <p className="mt-1 text-sm text-muted">{row.message}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <GlowButton href={results.cta.href}>{results.cta.label}</GlowButton>
        </div>
      </div>
    </section>
  );
}
