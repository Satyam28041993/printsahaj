import React from "react";

const STEPS = ["Problem", "Understand", "Build", "Automate", "Grow"] as const;

export default function ProcessFlow() {
  return (
    <ol className="relative" aria-label="How PrintSahaj thinks">
      <svg
        className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] hidden h-px w-[80%] lg:block"
        viewBox="0 0 800 2"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="1" x2="800" y2="1" stroke="var(--border)" strokeWidth="2" />
        <line
          className="dash-flow"
          x1="0"
          y1="1"
          x2="800"
          y2="1"
          stroke="var(--accent)"
          strokeWidth="2"
        />
      </svg>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, index) => (
          <li key={step} className="relative text-center lg:pt-2">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-accent-line bg-elevated font-mono text-[11px] text-accent shadow-[0_0_24px_-10px_var(--accent-glow-strong)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-primary">{step}</p>
            {index < STEPS.length - 1 ? (
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-faint lg:hidden">
                Next
              </span>
            ) : null}
          </li>
        ))}
      </div>
    </ol>
  );
}
