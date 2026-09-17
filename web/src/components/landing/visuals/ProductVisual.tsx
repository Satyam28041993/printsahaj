import React from "react";

export default function ProductVisual({ name }: { name: string }) {
  if (name === "PrintVerify") return <PrintVerifyVisual />;
  if (name === "Flexora") return <FlexoraVisual />;
  return <GenericProductVisual />;
}

function PrintVerifyVisual() {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-hairline bg-sunken" aria-hidden="true">
      <div className="absolute inset-0 bg-registration-marks opacity-60" />
      <div className="absolute left-1/2 top-6 h-[7.25rem] w-36 -translate-x-[38%] rotate-[-8deg] rounded-md border border-hairline bg-elevated/70" />
      <div className="absolute left-1/2 top-8 h-[7.25rem] w-36 -translate-x-[22%] rotate-[-3deg] rounded-md border border-[color-mix(in_srgb,var(--cyan)_45%,var(--border))] bg-[color-mix(in_srgb,var(--cyan)_10%,transparent)]" />
      <div className="absolute left-1/2 top-10 h-[7.25rem] w-36 -translate-x-[6%] rounded-md border border-accent-line bg-elevated p-3 shadow-[var(--shadow-card)]">
        <span className="block h-1.5 w-12 rounded-full bg-accent" />
        <span className="mt-2 block h-1 w-20 rounded-full bg-hairline" />
        <span className="mt-1.5 block h-1 w-14 rounded-full bg-hairline" />
        <span className="mt-5 inline-flex h-5 items-center rounded-full border border-accent-line px-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
          Check
        </span>
      </div>
      <svg className="absolute right-3 top-3 h-6 w-6 text-faint" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h4M16 4h4M4 20h4M16 20h4M4 4v4M20 4v4M4 16v4M20 16v4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function FlexoraVisual() {
  const rows = ["Order", "Job", "System"];
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-hairline bg-sunken p-4" aria-hidden="true">
      <div className="absolute right-6 top-5 h-16 w-16 rounded-full bg-[var(--violet-weak)] blur-2xl" />
      <div className="relative space-y-2">
        {rows.map((row, index) => (
          <div
            key={row}
            className="flex items-center justify-between rounded-lg border border-hairline bg-elevated/80 px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs text-primary">{row}</span>
            </span>
            <span className="h-1 w-10 rounded-full bg-hairline" style={{ opacity: 1 - index * 0.15 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericProductVisual() {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-hairline bg-sunken" aria-hidden="true">
      <div className="absolute inset-6 rounded-lg border border-dashed border-hairline" />
    </div>
  );
}
