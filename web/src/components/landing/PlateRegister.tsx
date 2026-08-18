"use client";

import React, { useLayoutEffect, useRef } from "react";
import { ensureGsap } from "@/lib/motion";
import { hero } from "@content/hero";

/**
 * Where each plate starts before it slides into register. Distinct vectors so
 * the six converge on the mark rather than marching in from one side.
 */
const ENTRY: ReadonlyArray<{ x: number; y: number; r: number }> = [
  { x: -58, y: -34, r: -1.1 },
  { x: 52, y: -40, r: 0.9 },
  { x: -44, y: 38, r: 0.7 },
  { x: 60, y: 28, r: -0.8 },
  { x: -68, y: 8, r: 1.2 },
  { x: 34, y: 46, r: -0.6 },
];

/** Registered plate geometry, in viewBox units. */
const PLATE = { x: 112, y: 40, w: 416, h: 272 } as const;
const CROSS_OFFSET = 20;
const CROSS_ARM = 10;

/** Deterministic barcode — never randomised, so server and client agree. */
const BARCODE = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 2, 1, 1, 3, 1, 2];

function RegistrationMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <line x1={cx - CROSS_ARM} y1={cy} x2={cx + CROSS_ARM} y2={cy} />
      <line x1={cx} y1={cy - CROSS_ARM} x2={cx} y2={cy + CROSS_ARM} />
      <circle cx={cx} cy={cy} r="4.5" />
    </g>
  );
}

/**
 * The hero visual: six separation plates sliding into perfect register to form
 * one label — and, once they have, a seventh slot that stayed empty.
 *
 * The markup is authored in its FINAL state. The timeline runs only when the
 * visitor has not asked for reduced motion, so the still page is already correct.
 */
export default function PlateRegister() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(root, { opacity: 0, y: 16, duration: 0.5, ease: "power2.out" }, 0);

        // The six plates converge.
        gsap.utils.toArray<SVGGElement>("[data-plate-group]", root).forEach((plate, i) => {
          const entry = ENTRY[i] ?? ENTRY[0];
          tl.from(
            plate,
            {
              x: entry.x,
              y: entry.y,
              rotate: entry.r,
              opacity: 0,
              duration: 0.8,
              transformOrigin: "50% 50%",
            },
            0.15 + i * 0.09,
          );
        });

        // Register lands: the crosshairs snap to full strength.
        tl.from(
          "[data-marks]",
          { opacity: 0, scale: 0.86, duration: 0.2, ease: "back.out(2)", transformOrigin: "50% 50%" },
          0.85,
        );

        // The composite label resolves out of the aligned stack.
        tl.from("[data-composite]", { opacity: 0, duration: 0.2 }, 1.0);

        // The manifest ticks through, then the empty slot arrives alone.
        tl.from(
          "[data-chip]",
          { opacity: 0, y: 8, duration: 0.28, stagger: 0.05 },
          0.5,
        );
        tl.from("[data-missing]", { opacity: 0, y: 10, duration: 0.3 }, 1.15);
        tl.from("[data-caption]", { opacity: 0, duration: 0.3 }, 1.35);

        return () => tl.kill();
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  const marks: Array<[number, number]> = [
    [PLATE.x - CROSS_OFFSET, PLATE.y - CROSS_OFFSET],
    [PLATE.x + PLATE.w + CROSS_OFFSET, PLATE.y - CROSS_OFFSET],
    [PLATE.x - CROSS_OFFSET, PLATE.y + PLATE.h + CROSS_OFFSET],
    [PLATE.x + PLATE.w + CROSS_OFFSET, PLATE.y + PLATE.h + CROSS_OFFSET],
  ];

  return (
    <div ref={rootRef} className="w-full">
      <svg
        viewBox="0 0 640 352"
        className="w-full h-auto"
        role="img"
        aria-label={hero.visual.altText}
      >
        {/* Plate bodies. Registered, they coincide exactly — which is the point. */}
        {hero.visual.plates.map((plate) => (
          <g data-plate-group key={plate.label} style={{ color: plate.colorVar }}>
            <rect
              x={PLATE.x}
              y={PLATE.y}
              width={PLATE.w}
              height={PLATE.h}
              rx="3"
              fill="currentColor"
              fillOpacity="0.05"
              stroke="currentColor"
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Registration marks: one crisp crosshair per corner once aligned. */}
        <g data-marks className="text-[var(--text-faint)]">
          {marks.map(([cx, cy]) => (
            <RegistrationMark key={`${cx}-${cy}`} cx={cx} cy={cy} />
          ))}
        </g>

        {/* The composite label the six plates add up to. */}
        <g data-composite className="text-[var(--text-primary)]">
          <text
            x={PLATE.x + 36}
            y={PLATE.y + 66}
            className="font-display"
            fontSize="34"
            fontWeight="700"
            fill="currentColor"
            fillOpacity="0.9"
          >
            DAILY PHARMA
          </text>
          <rect
            x={PLATE.x + 36}
            y={PLATE.y + 84}
            width="200"
            height="2.5"
            fill="var(--ink-magenta)"
            fillOpacity="0.75"
          />
          {[0, 1, 2].map((row) => (
            <rect
              key={row}
              x={PLATE.x + 36}
              y={PLATE.y + 108 + row * 16}
              width={row === 2 ? 158 : 226}
              height="6"
              rx="3"
              fill="currentColor"
              fillOpacity="0.22"
            />
          ))}

          {/* Barcode */}
          <g transform={`translate(${PLATE.x + 36}, ${PLATE.y + 174})`}>
            {BARCODE.reduce<{ x: number; bars: React.ReactElement[] }>(
              (acc, w, i) => {
                if (i % 2 === 0) {
                  acc.bars.push(
                    <rect
                      key={i}
                      x={acc.x}
                      y="0"
                      width={w * 2.1}
                      height="48"
                      fill="currentColor"
                      fillOpacity="0.7"
                    />,
                  );
                }
                acc.x += w * 2.1 + 1.8;
                return acc;
              },
              { x: 0, bars: [] },
            ).bars}
            <text
              x="0"
              y="62"
              className="font-mono"
              fontSize="11"
              fill="currentColor"
              fillOpacity="0.5"
            >
              8901234567894
            </text>
          </g>

          {/* Spot-ink roundel, sitting on plate 7483 */}
          <circle
            cx={PLATE.x + PLATE.w - 70}
            cy={PLATE.y + 78}
            r="34"
            fill="none"
            stroke="var(--ink-cyan)"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          <text
            x={PLATE.x + PLATE.w - 70}
            y={PLATE.y + 83}
            textAnchor="middle"
            className="font-mono"
            fontSize="13"
            fill="currentColor"
            fillOpacity="0.6"
          >
            7483
          </text>

          <text
            x={PLATE.x + PLATE.w - 36}
            y={PLATE.y + PLATE.h - 24}
            textAnchor="end"
            className="font-mono"
            fontSize="11"
            fill="currentColor"
            fillOpacity="0.45"
          >
            114 × 76 mm
          </text>
        </g>
      </svg>

      {/* Plate manifest. HTML rather than SVG text so it stays legible and
          selectable at every viewport width. */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {hero.visual.plates.map((plate) => (
          <span
            data-chip
            key={plate.label}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: plate.colorVar }}
            />
            {plate.label}
          </span>
        ))}

        <span
          data-missing
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--accent-line)] bg-[var(--accent-weak)] px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-[var(--accent)]"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M6 1.4L11 10.6H1L6 1.4z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M6 5v2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="6" cy="8.9" r="0.65" fill="currentColor" />
          </svg>
          {hero.visual.missingPlate.label}
        </span>
      </div>

      <p
        data-caption
        className="mt-4 text-center font-mono text-[11px] leading-relaxed tracking-[0.04em] text-faint"
      >
        {hero.visual.caption}
      </p>
    </div>
  );
}
