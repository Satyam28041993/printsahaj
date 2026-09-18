"use client";

import React, { useEffect, useRef, useState } from "react";
import { home } from "@content/home";
import { prefersReducedMotion } from "@/lib/motion";

const SATELLITE_STYLE = [
  { top: "6%", left: "0%" },
  { top: "18%", right: "0%" },
  { top: "44%", left: "0%" },
  { top: "52%", right: "0%" },
  { bottom: "18%", left: "4%" },
  { bottom: "6%", right: "2%" },
] as const;

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
  const boardRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setLive((current) => (current + 1) % spine.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [spine.length]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = board.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    board.style.setProperty("--tilt-x", `${x.toFixed(1)}px`);
    board.style.setProperty("--tilt-y", `${y.toFixed(1)}px`);
  };

  const onPointerLeave = () => {
    boardRef.current?.style.setProperty("--tilt-x", "0px");
    boardRef.current?.style.setProperty("--tilt-y", "0px");
  };

  return (
    <div
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="system-board"
      style={{ transform: "translate3d(var(--tilt-x, 0px), var(--tilt-y, 0px), 0)" }}
      role="img"
      aria-label={ariaLabel}
    >
      <ol className="system-spine mx-auto max-w-[16rem] space-y-5 py-6 lg:py-10">
        {spine.map((step, index) => (
          <li key={step.label} className={`system-step ${index <= live ? "is-live" : ""}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{step.hint}</p>
            <p className="mt-1 font-display text-lg font-semibold text-primary">{step.label}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:mt-0 lg:contents">
        {satellites.map((satellite, index) => (
          <li
            key={satellite.label}
            className="system-satellite"
            style={SATELLITE_STYLE[index]}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{satellite.hint}</p>
            <p className="mt-1 text-sm font-medium text-primary">{satellite.label}</p>
            <SatelliteFace index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}
