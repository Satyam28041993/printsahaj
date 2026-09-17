import React from "react";

const STAGES = [
  "Artwork",
  "Prepress",
  "Printing",
  "Production",
  "QC",
  "Procurement",
  "Sales",
  "Growth",
] as const;

const NODES = [
  { x: 86, y: 42 },
  { x: 168, y: 42 },
  { x: 250, y: 42 },
  { x: 332, y: 42 },
  { x: 332, y: 118 },
  { x: 250, y: 118 },
  { x: 168, y: 118 },
  { x: 86, y: 118 },
] as const;

export default function PrintWorkflow() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-hairline bg-sunken">
      <div className="pointer-events-none absolute inset-0 bg-registration-marks opacity-50" />
      <div className="relative grid lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]">
        <div className="flex items-center justify-center p-8">
          <svg viewBox="0 0 180 180" className="h-44 w-44 text-muted" aria-hidden="true">
            <rect x="28" y="36" width="92" height="118" rx="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M120 48c28 10 38 38 18 64" stroke="var(--accent)" strokeWidth="6" fill="none" />
            <circle cx="138" cy="112" r="18" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="1.4" />
            <path d="M44 56h60M44 72h48M44 88h54" stroke="var(--border)" strokeWidth="1.2" />
            <path
              d="M18 18h16M146 18h16M18 162h16M146 162h16M18 18v16M162 18v16M18 146v16M162 146v16"
              stroke="currentColor"
            />
          </svg>
        </div>
        <div className="p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            Printing & packaging workflow
          </p>
          <svg viewBox="0 0 400 168" className="mt-6 h-auto w-full" aria-hidden="true">
            <path
              d="M86 42 H332 V118 H86"
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <path
              className="dash-flow"
              d="M86 42 H332 V118 H86"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            {NODES.map((node, index) => (
              <g key={STAGES[index]}>
                <circle cx={node.x} cy={node.y} r="16" fill="var(--bg-elevated)" stroke="var(--accent-line)" />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="var(--accent)"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                >
                  {String(index + 1).padStart(2, "0")}
                </text>
                <text
                  x={node.x}
                  y={node.y + 34}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="11"
                >
                  {STAGES[index]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
