"use client";

import React, { useEffect, useRef, useState } from "react";

function StageWindow({ index }: { index: number }) {
  if (index <= 0) {
    return (
      <svg className="h-28 w-full text-accent" viewBox="0 0 240 96" fill="none" aria-hidden="true">
        <circle cx="120" cy="48" r="10" fill="currentColor" opacity="0.35" />
        <circle cx="48" cy="24" r="6" stroke="currentColor" />
        <circle cx="200" cy="28" r="6" stroke="currentColor" />
        <circle cx="36" cy="72" r="6" stroke="currentColor" />
        <circle cx="188" cy="76" r="6" stroke="currentColor" />
        <path d="M54 28h56M186 32H132M46 68h62M180 72h-48" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <div className="rounded-xl border border-hairline bg-sunken p-3">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--magenta)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--yellow)]" />
        </span>
        <span className="mt-4 block h-2 w-24 rounded-full bg-hairline" />
        <span className="mt-2 block h-2 w-36 rounded-full bg-hairline" />
        <span className="mt-5 h-8 w-20 rounded-md bg-accent/80" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="space-y-2">
        <span className="block h-8 rounded-lg border border-hairline bg-sunken" />
        <span className="block h-8 rounded-lg border border-accent-line bg-accent-weak" />
        <span className="block h-8 rounded-lg border border-hairline bg-sunken" />
      </div>
    );
  }
  if (index === 3) {
    return (
      <div className="space-y-2">
        {["Contact", "Company", "Status"].map((row) => (
          <div key={row} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2">
            <span className="text-xs text-muted">{row}</span>
            <span className="h-1.5 w-10 rounded-full bg-hairline" />
          </div>
        ))}
      </div>
    );
  }
  if (index === 4) {
    return (
      <svg className="mx-auto h-28 w-36 text-accent" viewBox="0 0 120 96" fill="none" aria-hidden="true">
        <path d="M12 12h96L84 48H36L12 12z" stroke="currentColor" />
        <path d="M40 52h40L68 84H52L40 52z" fill="currentColor" opacity="0.35" />
      </svg>
    );
  }
  if (index === 5) {
    return (
      <div className="space-y-3">
        <div className="ml-8 rounded-2xl rounded-tr-sm border border-hairline bg-sunken px-3 py-2 text-xs text-muted">
          Follow-up
        </div>
        <div className="mr-8 rounded-2xl rounded-tl-sm border border-accent-line bg-accent-weak px-3 py-2 text-xs text-primary">
          Next step
        </div>
      </div>
    );
  }
  if (index === 6) {
    return (
      <div className="flex h-28 items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-line text-accent">
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 8.2l3 3.1 6-6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    );
  }
  return (
    <div className="flex h-28 items-end gap-2 px-2">
      {[28, 46, 34, 62, 40, 54].map((height, bar) => (
        <span
          key={bar}
          className="flex-1 rounded-sm bg-accent/70"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export default function FunnelJourney({
  stages,
  capabilities,
}: {
  stages: string[];
  capabilities: string[];
}) {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.index));
        if (visible.length === 0) return;
        setActive(Math.max(...visible));
      },
      { threshold: 0.55, rootMargin: "0px 0px -18% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stages]);

  const progress = stages.length > 1 ? active / (stages.length - 1) : 0;
  const pathLength = 640;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="ui-frame relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Growth engine</p>
        <p className="mt-4 font-display text-display-md font-semibold text-primary">{stages[active]}</p>
        <p className="mt-3 text-sm text-muted">
          Stage {String(active + 1).padStart(2, "0")} of {String(stages.length).padStart(2, "0")}
        </p>
        <div className="mt-8">
          <StageWindow index={active} />
        </div>
        <svg className="mt-8 h-28 w-full" viewBox="0 0 320 90" fill="none" aria-hidden="true">
          <path
            d="M12 70 C 60 70, 70 18, 120 18 S 180 70, 230 70 S 280 18, 308 18"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <path
            d="M12 70 C 60 70, 70 18, 120 18 S 180 70, 230 70 S 280 18, 308 18"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - pathLength * progress}
            className="transition-[stroke-dashoffset] duration-500"
          />
          {stages.map((stage, index) => {
            const x = 12 + (296 / Math.max(stages.length - 1, 1)) * index;
            const y = index % 2 === 0 ? 70 : 18;
            const on = index <= active;
            return (
              <circle
                key={stage}
                cx={x}
                cy={y}
                r={on ? 6 : 4}
                fill={on ? "var(--accent)" : "var(--bg-elevated)"}
                stroke="var(--accent-line)"
              />
            );
          })}
        </svg>
        <ul className="mt-6 flex flex-wrap gap-2">
          {capabilities.map((capability) => (
            <li key={capability}>
              <span className="capability-chip inline-flex min-h-10 items-center rounded-full px-3.5 py-2 text-sm text-muted">
                {capability}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ol className="relative">
        <span aria-hidden="true" className="absolute left-[17px] top-4 bottom-4 w-px bg-hairline" />
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-4 w-px origin-top bg-accent transition-[height] duration-500 ease-out"
          style={{ height: `calc(${progress} * (100% - 2rem))` }}
        />
        {stages.map((stage, index) => {
          const isActive = index <= active;
          return (
            <li
              key={stage}
              data-index={index}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`funnel-node relative mb-3 flex items-center gap-4 rounded-2xl border border-hairline bg-elevated/70 px-3 py-3 last:mb-0 ${
                isActive ? "is-active" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                  isActive ? "border-accent-line bg-accent-weak text-accent" : "border-hairline text-faint"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-title font-medium">{stage}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
