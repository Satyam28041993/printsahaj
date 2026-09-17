"use client";

import React, { useRef } from "react";

const MODULES = [
  { id: "software", label: "Software", hint: "Systems", x: "50%", y: "7%", delay: "0s" },
  { id: "ai", label: "AI", hint: "Automation", x: "86%", y: "50%", delay: "0.4s" },
  { id: "growth", label: "Growth", hint: "Demand", x: "50%", y: "93%", delay: "0.8s" },
  { id: "tools", label: "Tools", hint: "Products", x: "14%", y: "50%", delay: "1.2s" },
] as const;

const PARTICLES = [
  { top: "18%", left: "22%", delay: "0s" },
  { top: "28%", left: "72%", delay: "1.1s" },
  { top: "62%", left: "18%", delay: "2s" },
  { top: "70%", left: "78%", delay: "0.6s" },
  { top: "42%", left: "12%", delay: "1.6s" },
  { top: "48%", left: "88%", delay: "2.4s" },
  { top: "14%", left: "54%", delay: "0.3s" },
  { top: "84%", left: "40%", delay: "1.8s" },
];

export default function HeroSystem() {
  const stageRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    stage.style.setProperty("--tilt-x", `${x.toFixed(1)}px`);
    stage.style.setProperty("--tilt-y", `${y.toFixed(1)}px`);
  };

  const onPointerLeave = () => {
    stageRef.current?.style.setProperty("--tilt-x", "0px");
    stageRef.current?.style.setProperty("--tilt-y", "0px");
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden"
      style={{
        transform: "translate3d(var(--tilt-x, 0px), var(--tilt-y, 0px), 0)",
        transition: "transform 220ms ease",
      }}
      aria-hidden="true"
    >
      <div className="hero-perspective pointer-events-none absolute inset-[-12%] opacity-70" />
      <div className="ambient-sweep pointer-events-none absolute inset-0 rounded-full opacity-80" />
      <div
        className="glow-breathe pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 68%)",
        }}
      />

      {PARTICLES.map((particle) => (
        <span
          key={`${particle.top}-${particle.left}`}
          className="particle"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
          }}
        />
      ))}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
        <line className="dash-flow" x1="50" y1="50" x2="50" y2="16" stroke="var(--accent-line)" strokeWidth="0.35" />
        <line className="dash-flow" x1="50" y1="50" x2="84" y2="50" stroke="var(--accent-line)" strokeWidth="0.35" />
        <line className="dash-flow" x1="50" y1="50" x2="50" y2="84" stroke="var(--accent-line)" strokeWidth="0.35" />
        <line className="dash-flow" x1="50" y1="50" x2="16" y2="50" stroke="var(--accent-line)" strokeWidth="0.35" />
        <circle cx="50" cy="50" r="11" stroke="var(--accent-line)" strokeWidth="0.35" />
      </svg>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-[7.5rem] w-[7.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-accent-line bg-elevated/90 shadow-[0_0_40px_-12px_var(--accent-glow-strong)]">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--magenta)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--yellow)]" />
        </span>
        <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
          System
        </span>
      </div>

      {MODULES.map((mod, index) => (
        <div
          key={mod.id}
          className={`absolute z-10 w-[6.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-hairline bg-elevated/90 px-3 py-2.5 shadow-[var(--shadow-card)] ${
            index % 2 === 0 ? "float-slow" : "float-slower"
          }`}
          style={{ left: mod.x, top: mod.y, animationDelay: mod.delay }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{mod.hint}</p>
          <p className="mt-1 text-xs font-medium text-primary">{mod.label}</p>
        </div>
      ))}
    </div>
  );
}
