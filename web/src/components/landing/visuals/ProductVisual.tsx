import React from "react";

export default function ProductVisual({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  const height = size === "lg" ? "min-h-[280px] h-full" : "h-40";
  if (name === "PrintVerify") return <PrintVerifyVisual height={height} />;
  if (name === "Flexora") return <FlexoraVisual height={height} />;
  return <div className={`relative overflow-hidden rounded-xl border border-hairline bg-sunken ${height}`} />;
}

function PrintVerifyVisual({ height }: { height: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-hairline bg-sunken ${height}`} aria-hidden="true">
      <div className="absolute inset-0 bg-registration-marks opacity-70" />
      <div className="absolute left-[12%] top-[18%] h-[62%] w-[28%] rotate-[-10deg] rounded-lg border border-hairline bg-elevated/70" />
      <div className="absolute left-[22%] top-[22%] h-[62%] w-[28%] rotate-[-5deg] rounded-lg border border-[color-mix(in_srgb,var(--cyan)_50%,var(--border))] bg-[color-mix(in_srgb,var(--cyan)_12%,transparent)]" />
      <div className="absolute left-[32%] top-[26%] h-[62%] w-[32%] rounded-lg border border-accent-line bg-elevated p-5 shadow-[var(--shadow-card)]">
        <span className="block h-2 w-16 rounded-full bg-accent" />
        <span className="mt-3 block h-1.5 w-24 rounded-full bg-hairline" />
        <span className="mt-2 block h-1.5 w-20 rounded-full bg-hairline" />
        <span className="mt-2 block h-1.5 w-14 rounded-full bg-hairline" />
        <div className="mt-8 flex gap-2">
          <span className="rounded-full border border-accent-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
            Artwork
          </span>
          <span className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            Plate
          </span>
        </div>
      </div>
      <svg className="absolute right-5 top-5 h-8 w-8 text-faint" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h4M16 4h4M4 20h4M16 20h4M4 4v4M20 4v4M4 16v4M20 16v4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function FlexoraVisual({ height }: { height: string }) {
  const rows = ["Order", "Job", "System"];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-hairline bg-sunken p-6 ${height}`} aria-hidden="true">
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[var(--violet-weak)] blur-2xl" />
      <div className="relative grid h-full grid-cols-3 gap-3">
        {rows.map((row, index) => (
          <div key={row} className="flex flex-col justify-between rounded-xl border border-hairline bg-elevated/85 p-4">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm text-primary">{row}</p>
            </div>
            <span className="mt-4 h-1 w-full rounded-full bg-hairline" />
          </div>
        ))}
      </div>
    </div>
  );
}
