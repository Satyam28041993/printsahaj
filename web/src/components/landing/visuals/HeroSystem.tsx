"use client";

import React, { useEffect, useState } from "react";
import { home } from "@content/home";
import { prefersReducedMotion } from "@/lib/motion";

function SatelliteFace({ index }: { index: number }) {
  if (index === 0) {
    return (
      <ul className="mt-2 space-y-1.5" aria-hidden="true">
        {["Open", "Quote", "Follow-up"].map((row) => (
          <li key={row} className="flex items-center justify-between gap-2">
            <span className="h-1 w-8 rounded-full bg-hairline" />
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">{row}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (index === 1) {
    return (
      <div className="mt-2 grid grid-cols-5 gap-0.5" aria-hidden="true">
        {Array.from({ length: 25 }, (_, cell) => (
          <span
            key={cell}
            className={`h-1.5 ${cell % 3 === 0 || cell % 7 === 0 ? "bg-primary" : "bg-transparent"}`}
          />
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <p className="mt-2 font-mono text-[9px] leading-relaxed text-muted">
        Declared 7 units
        <br />
        Found 6 plates
      </p>
    );
  }
  if (index === 3) {
    return (
      <svg className="mt-2 h-10 w-full text-accent" viewBox="0 0 80 28" fill="none" aria-hidden="true">
        <path d="M4 14h16M20 14c8 0 8-10 16-10M20 14c8 0 8 10 16 10" stroke="currentColor" />
        <circle cx="56" cy="4" r="2.5" fill="currentColor" />
        <circle cx="56" cy="14" r="2.5" fill="currentColor" />
        <circle cx="56" cy="24" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  if (index === 4) {
    return (
      <div className="mt-2 flex h-8 items-end gap-1" aria-hidden="true">
        {[40, 62, 48, 78, 55].map((height, bar) => (
          <span key={bar} className="flex-1 bg-accent/70" style={{ height: `${height}%` }} />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2 space-y-1" aria-hidden="true">
      <span className="block h-4 rounded-sm border border-hairline bg-sunken" />
      <span className="ml-3 block h-4 rounded-sm border border-accent-line bg-accent-weak" />
    </div>
  );
}

export default function HeroSystem() {
  const { spine, satellites, ariaLabel } = home.hero.system;
  const [live, setLive] = useState(0);
  const left = satellites.filter((_, index) => index % 2 === 0);
  const right = satellites.filter((_, index) => index % 2 === 1);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setLive((current) => (current + 1) % spine.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [spine.length]);

  return (
    <div className="system-board" role="img" aria-label={ariaLabel}>
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(9rem,0.7fr)_minmax(0,1fr)_minmax(9rem,0.7fr)]">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {left.map((satellite, index) => {
            const original = index * 2;
            return (
              <li key={satellite.label} className="system-satellite">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{satellite.hint}</p>
                <p className="mt-1 text-sm font-medium text-primary">{satellite.label}</p>
                <SatelliteFace index={original} />
              </li>
            );
          })}
        </ul>

        <ol className="system-spine space-y-5 py-2">
          {spine.map((step, index) => (
            <li key={step.label} className={`system-step ${index <= live ? "is-live" : ""}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{step.hint}</p>
              <p className="mt-1 font-display text-lg font-semibold text-primary">{step.label}</p>
            </li>
          ))}
        </ol>

        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {right.map((satellite, index) => {
            const original = index * 2 + 1;
            return (
              <li key={satellite.label} className="system-satellite">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{satellite.hint}</p>
                <p className="mt-1 text-sm font-medium text-primary">{satellite.label}</p>
                <SatelliteFace index={original} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
