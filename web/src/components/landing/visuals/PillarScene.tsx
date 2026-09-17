import React from "react";

/**
 * A cropped piece of real product UI for each pillar card.
 *
 * These are drawn, not screenshotted, for three reasons: they stay sharp at
 * every width, they follow the theme tokens instead of burning one theme into
 * a PNG, and they weigh nothing. Every label is a category name, never a
 * number — the homepage does not claim results it cannot show.
 *
 * Each scene fills its panel top to bottom. A panel with its content bunched
 * at the top reads as an unfinished box; a full one reads as a real screen
 * that happens to be cropped by the card edge.
 */

const BAR = "rounded-full bg-white/10";
const BAR_FAINT = "rounded-full bg-white/[0.055]";

/** CRM and business systems: a record list, the shape every such system takes. */
function SoftwareScene() {
  const rows = [
    { w: "w-[58%]", pill: "Open" },
    { w: "w-[44%]", pill: "In progress" },
    { w: "w-[62%]", pill: "Open" },
    { w: "w-[38%]", pill: "Closed" },
    { w: "w-[52%]", pill: "In progress" },
    { w: "w-[47%]", pill: "Open" },
  ];

  return (
    <>
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--tint-ink)]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">Records</span>
        <span className={`ml-auto h-1.5 w-10 ${BAR_FAINT}`} />
      </div>
      <ul className="flex flex-1 flex-col justify-around px-4 py-3">
        {rows.map((row, index) => (
          <li key={index} className="flex items-center gap-2.5 py-1.5">
            <span className="h-5 w-5 shrink-0 rounded-md border border-hairline bg-white/[0.04]" />
            <span className={`h-1.5 ${row.w} ${BAR}`} />
            <span className="ml-auto shrink-0 rounded-full border border-[var(--tint-line)] px-1.5 py-0.5 font-mono text-[8px] tracking-[0.1em] text-[var(--tint-ink)]">
              {row.pill}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-hairline px-4 py-2.5">
        <span className={`h-1.5 w-14 ${BAR_FAINT}`} />
        <span className={`ml-auto h-1.5 w-8 ${BAR_FAINT}`} />
      </div>
    </>
  );
}

/** AI and automation: one request, routed to steps that then run on their own. */
function AiScene() {
  return (
    <>
      <div className="px-4 pt-4">
        <div className="rounded-lg border border-hairline bg-white/[0.03] px-2.5 py-2">
          <span className="font-mono text-[9px] tracking-[0.14em] text-faint">Ask</span>
          <span className={`mt-1.5 block h-1.5 w-[70%] ${BAR}`} />
        </div>
      </div>

      <div className="flex flex-1 items-center px-4">
        <svg viewBox="0 0 200 76" className="w-full" aria-hidden="true">
          <g stroke="var(--tint-line)" strokeWidth="1" fill="none">
            <path d="M18 38h26M44 38c14 0 14-22 28-22M44 38c14 0 14 22 28 22M44 38h28" />
            <path d="M72 16h44M72 38h44M72 60h44" strokeDasharray="2 3" />
          </g>
          <circle cx="14" cy="38" r="4" fill="var(--tint-ink)" />
          {[16, 38, 60].map((y) => (
            <g key={y}>
              <circle cx="72" cy={y} r="3" fill="none" stroke="var(--tint-line)" />
              <rect x="120" y={y - 4} width="62" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
            </g>
          ))}
        </svg>
      </div>

      <ul className="space-y-2 border-t border-hairline px-4 py-3">
        {["w-[80%]", "w-[64%]", "w-[72%]"].map((w, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tint-line)]" />
            <span className={`h-1.5 ${w} ${BAR_FAINT}`} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Digital growth: the funnel, narrowing stage by stage the way the copy names it. */
function GrowthScene() {
  const stages = [
    { label: "Traffic", w: "w-[92%]" },
    { label: "Landing Page", w: "w-[76%]" },
    { label: "Lead", w: "w-[60%]" },
    { label: "CRM", w: "w-[46%]" },
    { label: "Qualification", w: "w-[38%]" },
    { label: "Follow-up", w: "w-[33%]" },
    { label: "Conversion", w: "w-[26%]" },
  ];

  return (
    <>
      <ul className="flex flex-1 flex-col justify-around px-4 py-4">
        {stages.map((stage, index) => (
          <li key={stage.label} className="flex items-center gap-2.5 py-1">
            <span className="w-[68px] shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-faint">
              {stage.label}
            </span>
            <span
              className={`h-4 ${stage.w} rounded-[3px]`}
              style={{
                background:
                  index === stages.length - 1
                    ? "var(--tint-ink)"
                    : `color-mix(in srgb, var(--tint-ink) ${54 - index * 6}%, transparent)`,
              }}
            />
          </li>
        ))}
      </ul>
      <div className="border-t border-hairline px-4 py-2.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
          Reporting
        </span>
      </div>
    </>
  );
}

/** Products and tools: an instrument, with the units these trades actually use. */
function ProductsScene() {
  return (
    <>
      <div className="px-4 pt-4">
        <svg viewBox="0 0 200 18" className="w-full" aria-hidden="true">
          {Array.from({ length: 27 }, (_, index) => (
            <line
              key={index}
              x1={4 + index * 7.4}
              y1={index % 5 === 0 ? 3 : 8}
              x2={4 + index * 7.4}
              y2="15"
              stroke="var(--tint-line)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <dl className="flex flex-1 flex-col justify-around px-4 py-3">
        {[
          ["Repeat", "teeth × 3.175"],
          ["Ream", "gsm ÷ 3100"],
          ["Ups", "Demy sheet"],
          ["Take-up", "3-ply 1.45"],
        ].map(([term, value]) => (
          <div key={term} className="flex items-center gap-2 border-b border-hairline py-2">
            <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">{term}</dt>
            <dd className="ml-auto font-mono text-[10px] text-[var(--tint-ink)]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-2 border-t border-hairline px-4 py-2.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">Result</span>
        <span className={`ml-auto h-1.5 w-16 ${BAR}`} />
      </div>
    </>
  );
}

const SCENES = {
  software: SoftwareScene,
  ai: AiScene,
  growth: GrowthScene,
  products: ProductsScene,
} as const;

export type PillarSceneId = keyof typeof SCENES;

export const PILLAR_SCENES: PillarSceneId[] = ["software", "ai", "growth", "products"];

export default function PillarScene({ id }: { id: PillarSceneId }) {
  const Scene = SCENES[id];
  return (
    <div className="feature-scene h-full w-full" aria-hidden="true">
      <Scene />
    </div>
  );
}
