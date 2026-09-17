import React from "react";

const STEPS = [
  { label: "Real business problem", kind: "start" },
  { label: "Understand", kind: "step" },
  { label: "Build", kind: "step" },
  { label: "Automate", kind: "step" },
  { label: "Grow", kind: "end" },
] as const;

export default function ProcessFlow() {
  return (
    <ol className="relative mx-auto max-w-sm" aria-label="How PrintSahaj thinks">
      <span
        aria-hidden="true"
        className="flow-track absolute left-[15px] top-3 bottom-3 w-px"
      />
      {STEPS.map((step, index) => (
        <li key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-0">
          <span
            className={`relative z-[1] mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
              step.kind === "start"
                ? "border-accent-line bg-accent-weak text-accent"
                : step.kind === "end"
                  ? "border-accent bg-accent text-[var(--accent-contrast)]"
                  : "border-hairline bg-elevated text-muted"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 font-display text-sm font-medium text-primary">{step.label}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
