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

export default function PrintWorkflow() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-elevated/50 p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-registration-marks opacity-50" />
      <svg
        className="pointer-events-none absolute right-4 top-4 h-8 w-8 text-faint"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 4h6M22 4h6M4 28h6M22 28h6M4 4v6M28 4v6M4 22v6M28 22v6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="10" y="10" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>

      <p className="relative font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        Printing & packaging workflow
      </p>

      <ol className="relative mt-5 flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {STAGES.map((stage, index) => (
          <li key={stage} className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-hairline bg-base/70 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-primary">{stage}</p>
            </div>
            {index < STAGES.length - 1 ? (
              <span aria-hidden="true" className="hidden h-px w-6 bg-accent-line sm:block" />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
