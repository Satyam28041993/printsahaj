import React from "react";

export default function ToolVisual({
  kind,
}: {
  kind: "verify" | "label" | "gsm" | "ups" | "repeat" | "board";
}) {
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-hairline bg-sunken" aria-hidden="true">
      <div className="absolute inset-0 bg-registration-marks opacity-40" />
      {kind === "verify" && <VerifyMark />}
      {kind === "label" && <LabelMark />}
      {kind === "gsm" && <GsmMark />}
      {kind === "ups" && <UpsMark />}
      {kind === "repeat" && <RepeatMark />}
      {kind === "board" && <BoardMark />}
    </div>
  );
}

function VerifyMark() {
  return (
    <>
      <div className="absolute left-8 top-6 h-20 w-16 rotate-[-8deg] rounded-md border border-hairline bg-elevated/80" />
      <div className="absolute left-14 top-8 h-20 w-16 rounded-md border border-accent-line bg-elevated p-2">
        <span className="block h-1 w-8 rounded-full bg-accent" />
        <span className="mt-2 block h-1 w-10 rounded-full bg-hairline" />
        <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">Check</span>
      </div>
    </>
  );
}

function LabelMark() {
  return (
    <svg className="absolute inset-0 h-full w-full text-accent" viewBox="0 0 160 90" fill="none">
      <rect x="18" y="22" width="70" height="46" rx="6" stroke="currentColor" strokeWidth="1.2" />
      <rect x="28" y="30" width="50" height="30" rx="3" stroke="var(--border)" />
      <path d="M96 28h40M96 40h28M96 52h34" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function GsmMark() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 90" fill="none">
      <rect x="30" y="18" width="48" height="56" rx="2" stroke="var(--accent)" strokeWidth="1.2" />
      <rect x="42" y="26" width="48" height="56" rx="2" stroke="var(--border)" />
      <rect x="54" y="34" width="48" height="44" rx="2" fill="var(--bg-elevated)" stroke="var(--accent-line)" />
    </svg>
  );
}

function UpsMark() {
  return (
    <div className="absolute inset-5 grid grid-cols-4 grid-rows-3 gap-1.5">
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className={`rounded-sm border ${index === 5 ? "border-accent bg-accent-weak" : "border-hairline"}`}
        />
      ))}
    </div>
  );
}

function RepeatMark() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 90" fill="none">
      <circle cx="80" cy="45" r="28" stroke="var(--accent)" strokeWidth="1.3" className="dash-flow" />
      <circle cx="80" cy="45" r="8" fill="var(--accent)" opacity="0.35" />
      <path d="M80 17v10M80 63v10M52 45h-10M118 45h10" stroke="var(--accent-line)" />
    </svg>
  );
}

function BoardMark() {
  return (
    <div className="absolute inset-x-8 top-8 space-y-1.5">
      <span className="block h-4 rounded-sm bg-[color-mix(in_srgb,var(--cyan)_35%,transparent)]" />
      <span className="block h-6 rounded-sm bg-[color-mix(in_srgb,var(--magenta)_20%,transparent)]" />
      <span className="block h-4 rounded-sm bg-[color-mix(in_srgb,var(--yellow)_25%,transparent)]" />
    </div>
  );
}
