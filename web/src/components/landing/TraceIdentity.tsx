"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/useReveal";
import { prefersReducedMotion } from "@/lib/motion";
import { home } from "@content/home";

function QrMark() {
  const cells = Array.from({ length: 121 }, (_, index) => {
    const column = index % 11;
    const row = Math.floor(index / 11);
    const finder =
      (row < 3 && column < 3) ||
      (row < 3 && column > 7) ||
      (row > 7 && column < 3);
    const data = (row * 3 + column * 5) % 4 !== 0;
    return finder || data;
  });

  return (
    <div className="qr-mark" aria-hidden="true">
      {cells.map((cell, index) => (
        <span key={index} className={cell ? "" : "is-gap"} />
      ))}
    </div>
  );
}

export default function TraceIdentity() {
  const copy = home.identity;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    timerRef.current = window.setInterval(() => {
      setActive((current) => (current + 1) % copy.stages.length);
    }, 2600);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [copy.stages.length]);

  const selectStage = (index: number) => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActive(index);
  };

  const scanned = active >= 2;
  const found = active >= 3;

  return (
    <section aria-labelledby="identity-heading" className="relative scroll-mt-28 px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-7xl">
        <p data-reveal className="story-kicker">
          {copy.kicker}
        </p>
        <h2
          data-reveal
          id="identity-heading"
          className="mt-6 max-w-[16ch] font-display text-display-xl font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-6 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>

        <div data-reveal className="mt-14 grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ol className="space-y-0">
            {copy.stages.map((stage, index) => {
              const isActive = index === active;
              return (
                <li key={stage.label} className={`border-l py-4 pl-5 ${isActive ? "border-accent" : "border-hairline"}`}>
                  <button
                    type="button"
                    onClick={() => selectStage(index)}
                    aria-label={stage.label}
                    aria-pressed={isActive}
                    className="block min-h-11 w-full cursor-pointer text-left"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 font-display text-title font-semibold text-primary">{stage.label}</p>
                    <p className="mt-1 text-sm text-muted">{stage.detail}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="grid gap-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="identity-phone">
              <div className="identity-phone__screen flex flex-col items-center justify-center gap-5 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  {scanned ? copy.scanLabel : copy.stages[0]?.label}
                </p>
                <div className="relative">
                  <QrMark />
                  {scanned && !prefersReducedMotion() ? <span className="scan-beam" /> : null}
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                  {found ? copy.resultLabel : copy.stages[active]?.label}
                </p>
              </div>
            </div>

            <dl className="space-y-3 self-center">
              {copy.fields.map((field, index) => (
                <div
                  key={field.label}
                  className={`border px-4 py-3 ${found && index <= active ? "border-accent-line bg-accent-weak" : "border-hairline bg-elevated"}`}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{field.label}</dt>
                  <dd className="mt-1 text-sm text-primary">{found ? field.value : "—"}</dd>
                </div>
              ))}
              <p className="pt-2 text-sm text-muted">{copy.note}</p>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
