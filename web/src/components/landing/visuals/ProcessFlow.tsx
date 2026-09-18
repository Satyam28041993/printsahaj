"use client";

import React, { useEffect, useRef, useState } from "react";
import { home, type HomeJourneyStage } from "@content/home";

function StageVisual({ visual }: { visual: HomeJourneyStage["visual"] }) {
  if (visual === "problem") {
    return (
      <ul className="grid grid-cols-2 gap-3 p-6">
        {home.problem.fragments.map((fragment) => (
          <li key={fragment} className="border border-hairline bg-elevated px-3 py-3 text-sm text-muted">
            {fragment}
          </li>
        ))}
      </ul>
    );
  }
  if (visual === "understand") {
    return (
      <div className="flex h-full flex-col justify-between p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Notes from the work</p>
        <ul className="mt-6 space-y-4">
          {home.whatIsPrintSahaj.principleLines.map((line) => (
            <li key={line} className="border-l border-accent-line pl-4 text-title text-primary">
              {line}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (visual === "build") {
    return (
      <div className="grid h-full grid-rows-3">
        {["CRM record", "Internal system", "Dashboard"].map((row, index) => (
          <div key={row} className="flex items-center justify-between border-b border-hairline px-6 last:border-b-0">
            <span className="font-mono text-[10px] text-faint">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm text-primary">{row}</span>
            <span className="h-1.5 w-16 rounded-full bg-hairline" />
          </div>
        ))}
      </div>
    );
  }
  if (visual === "automate") {
    return (
      <svg viewBox="0 0 320 180" className="h-full w-full p-6" aria-hidden="true">
        <path
          className="dash-flow"
          d="M30 90 H90 C110 90 110 40 140 40 H210 M90 90 C110 90 110 140 140 140 H210"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
        />
        <circle cx="30" cy="90" r="8" fill="var(--accent)" />
        <rect x="210" y="28" width="80" height="24" fill="var(--bg-elevated)" stroke="var(--border)" />
        <rect x="210" y="78" width="80" height="24" fill="var(--bg-elevated)" stroke="var(--accent-line)" />
        <rect x="210" y="128" width="80" height="24" fill="var(--bg-elevated)" stroke="var(--border)" />
      </svg>
    );
  }
  return (
    <ol className="flex h-full flex-col justify-center gap-2 p-6">
      {home.digitalGrowth.funnel.map((stage, index) => (
        <li key={stage} className="flex items-center gap-3">
          <span className="w-6 font-mono text-[10px] text-faint">{String(index + 1).padStart(2, "0")}</span>
          <span
            className="h-7 bg-accent/80"
            style={{ width: `${Math.max(22, 100 - index * 9)}%` }}
          />
          <span className="shrink-0 text-xs text-primary">{stage}</span>
        </li>
      ))}
    </ol>
  );
}

export default function ProcessFlow() {
  const { stages } = home.journey;
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
      { threshold: 0.55, rootMargin: "0px 0px -20% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stages.length]);

  const current = stages[active] ?? stages[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ol aria-label="How PrintSahaj builds">
        {stages.map((stage, index) => {
          const isActive = index === active;
          return (
            <li
              key={stage.number}
              data-index={index}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`border-l py-5 pl-5 transition-colors duration-300 ${
                isActive ? "border-accent" : "border-hairline"
              }`}
            >
              <p className="font-mono text-[11px] text-accent">{stage.number}</p>
              <h3 className="mt-2 font-display text-display-md font-semibold text-primary">{stage.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{stage.summary}</p>
            </li>
          );
        })}
      </ol>

      <div className="lg:sticky lg:top-28">
        <div className="journey-visual overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{current.number}</p>
            <p className="text-sm text-primary">{current.title}</p>
          </div>
          <StageVisual visual={current.visual} />
        </div>
      </div>
    </div>
  );
}
