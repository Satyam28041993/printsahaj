import React from "react";

export default function FounderMark() {
  return (
    <div
      className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="78" stroke="var(--border)" strokeWidth="1" />
        <circle cx="100" cy="100" r="52" stroke="var(--accent-line)" strokeWidth="1" className="dash-flow" />
        <circle cx="100" cy="22" r="3.5" fill="var(--accent)" />
        <circle cx="168" cy="68" r="3.5" fill="var(--cyan)" />
        <circle cx="148" cy="162" r="3.5" fill="var(--magenta)" />
        <circle cx="42" cy="148" r="3.5" fill="var(--yellow)" />
        <circle cx="32" cy="64" r="3.5" fill="var(--violet)" />
        <path
          d="M100 22 L168 68 L148 162 L42 148 L32 64 Z"
          stroke="var(--accent-line)"
          strokeWidth="0.8"
          className="dash-flow"
        />
      </svg>
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-accent-line bg-elevated shadow-[0_0_50px_-18px_var(--accent-glow-strong)]">
        <span className="font-display text-5xl font-bold tracking-tight text-primary">SS</span>
      </div>
    </div>
  );
}
