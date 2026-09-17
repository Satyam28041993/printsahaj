"use client";

import React, { useRef } from "react";

function Frame({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`ui-frame rounded-2xl p-3 ${className}`}>
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function HeroStudio() {
  const stageRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
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
      className="relative mx-auto min-h-[420px] w-full max-w-[640px] lg:aspect-[1.02/1] lg:min-h-0"
      style={{
        transform: "translate3d(var(--tilt-x, 0px), var(--tilt-y, 0px), 0)",
        transition: "transform 240ms ease",
      }}
      aria-hidden="true"
    >
      <div className="hero-perspective pointer-events-none absolute inset-[-10%] opacity-80" />
      <div className="ambient-sweep pointer-events-none absolute inset-0" />
      <div
        className="glow-breathe pointer-events-none absolute left-1/2 top-[46%] h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute right-[6%] top-[8%] h-36 w-36 rounded-full"
        style={{ background: "radial-gradient(circle, var(--violet-weak) 0%, transparent 70%)" }}
      />
      <span className="particle left-[18%] top-[30%]" />
      <span className="particle left-[72%] top-[58%]" style={{ animationDelay: "1.6s" }} />
      <span className="particle left-[40%] top-[78%]" style={{ animationDelay: "3.2s" }} />

      <svg className="pointer-events-none absolute inset-[8%] h-[84%] w-[84%] opacity-80" viewBox="0 0 100 100" fill="none">
        <path
          className="dash-flow"
          d="M18 22 C 32 18, 38 38, 50 48"
          stroke="var(--accent-line)"
          strokeWidth="0.4"
        />
        <path
          className="dash-flow"
          d="M82 22 C 68 18, 62 38, 50 48"
          stroke="var(--accent-line)"
          strokeWidth="0.4"
        />
        <path
          className="dash-flow"
          d="M18 78 C 32 82, 38 62, 50 52"
          stroke="var(--accent-line)"
          strokeWidth="0.4"
        />
        <path
          className="dash-flow"
          d="M82 78 C 68 82, 62 62, 50 52"
          stroke="var(--accent-line)"
          strokeWidth="0.4"
        />
      </svg>

      <div className="relative flex h-full flex-col justify-between gap-4 p-1 lg:hidden">
        <div className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border border-accent-line bg-elevated shadow-[0_0_50px_-12px_var(--accent-glow-strong)]">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--magenta)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--yellow)]" />
          </span>
          <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">System</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Frame label="Software">
            <span className="text-[11px] text-muted">Workflow · CRM · ERP</span>
          </Frame>
          <Frame label="AI">
            <span className="text-[11px] text-muted">Assist · Automate</span>
          </Frame>
          <Frame label="Tools">
            <span className="text-[11px] text-muted">Calculators · Verify</span>
          </Frame>
          <Frame label="Products">
            <span className="text-[11px] text-muted">PrintVerify · Flexora</span>
          </Frame>
        </div>
        <Frame label="Growth">
          <p className="text-[10px] text-muted">Traffic → Lead → CRM → Convert</p>
        </Frame>
      </div>

      <div className="relative hidden h-full grid-cols-[1fr_auto_1fr] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 p-2 lg:grid">
        <Frame label="Software" className="float-slow self-start">
          <div className="space-y-1.5">
            {["Workflow", "CRM", "ERP"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-hairline px-2 py-1.5">
                <span className="text-[11px] text-primary">{item}</span>
                <span className="h-1 w-8 rounded-full bg-hairline" />
              </div>
            ))}
          </div>
        </Frame>

        <div />

        <Frame label="AI" className="float-slower self-start">
          <svg className="h-14 w-full text-accent" viewBox="0 0 120 48" fill="none">
            <circle cx="12" cy="14" r="4" stroke="currentColor" />
            <circle cx="12" cy="34" r="4" stroke="currentColor" />
            <circle cx="60" cy="24" r="5" fill="currentColor" opacity="0.35" />
            <circle cx="108" cy="12" r="4" stroke="currentColor" />
            <circle cx="108" cy="36" r="4" stroke="currentColor" />
            <path d="M16 14h38M16 34h38M65 24h39" stroke="currentColor" strokeWidth="1" />
          </svg>
        </Frame>

        <Frame label="Tools" className="float-slow self-center">
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-6 rounded-md border border-hairline bg-sunken" />
            ))}
          </div>
        </Frame>

        <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center self-center justify-self-center rounded-full border border-accent-line bg-elevated shadow-[0_0_50px_-12px_var(--accent-glow-strong)]">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--magenta)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--yellow)]" />
          </span>
          <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-primary">System</span>
        </div>

        <Frame label="Products" className="self-center">
          <div className="relative h-12">
            <span className="absolute left-1 top-1 h-9 w-10 rotate-[-8deg] rounded border border-hairline bg-elevated" />
            <span className="absolute left-5 top-2 h-9 w-10 rounded border border-accent-line bg-elevated" />
          </div>
        </Frame>

        <Frame label="Growth" className="float-slower col-span-3 self-end">
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted">
            {["Traffic", "Lead", "CRM", "Convert"].map((step, index) => (
              <React.Fragment key={step}>
                <span className={index === 3 ? "text-accent" : ""}>{step}</span>
                {index < 3 ? <span className="text-faint">→</span> : null}
              </React.Fragment>
            ))}
          </div>
          <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-hairline">
            <span className="block h-full w-2/3 rounded-full bg-accent" />
          </span>
        </Frame>
      </div>
    </div>
  );
}
