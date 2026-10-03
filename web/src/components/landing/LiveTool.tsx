"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { home } from "@content/home";
import { LABEL_RATE_DEFAULTS as DEFAULTS, labelRatePerThousand } from "@/lib/labelRate";

export default function LiveTool() {
  const [labelW, setLabelW] = useState(DEFAULTS.labelW);
  const [labelH, setLabelH] = useState(DEFAULTS.labelH);
  const [gapAround, setGapAround] = useState(DEFAULTS.gapAround);
  const [gapAcross, setGapAcross] = useState(DEFAULTS.gapAcross);
  const [paperRate, setPaperRate] = useState(DEFAULTS.paperRate);

  const rate = useMemo(
    () =>
      labelRatePerThousand({
        labelW,
        labelH,
        gapAround,
        gapAcross,
        paperRate,
        inkCostPer1k: DEFAULTS.inkCostPer1k,
        varnishCostPer1k: DEFAULTS.varnishCostPer1k,
        wastagePercent: DEFAULTS.wastagePercent,
      }),
    [labelW, labelH, gapAround, gapAcross, paperRate],
  );

  const others = home.ecosystem.tools.filter((tool) => tool.name !== "Label Rate & Matrix Costing");

  return (
    <section aria-labelledby="live-tool-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p data-m="reveal" className="story-kicker">Live tool</p>
          <h2 id="live-tool-heading" data-m="lines" className="mt-5 font-display text-display-lg font-bold text-primary text-balance">
            Roll Form Flexo Printing Label Rate Calculator
          </h2>
          <div data-m="reveal">
          <p data-m-child className="mt-5 max-w-md text-body-lg text-muted">
            Roll-label costing from size, gaps and the ₹/sqm paper rate. The figure updates from the same formula as the calculator.
          </p>
          <p data-m-child className="mt-4 font-mono text-[11px] leading-relaxed text-faint">
            Ink ₹35 / 1,000 · varnish ₹15 / 1,000 · wastage 12% — the calculator defaults.
          </p>
          <Link data-m-child href="/calculators/?tab=label-rate" className="founder-linkedin mt-8">
            Open the full calculator
          </Link>
          </div>
        </div>

        <form data-m="reveal" className="tool-window" onSubmit={(event) => event.preventDefault()}>
          <div className="tool-window__chrome">
            <p>Label Rate</p>
            <p className="text-faint">Live</p>
          </div>
          <div className="tool-window__grid">
            <Field label="Label width (mm)" value={labelW} onChange={setLabelW} />
            <Field label="Label height (mm)" value={labelH} onChange={setLabelH} />
            <Field label="Gap around (mm)" value={gapAround} onChange={setGapAround} />
            <Field label="Gap across (mm)" value={gapAcross} onChange={setGapAcross} />
            <Field label="Paper rate (₹ / sqm)" value={paperRate} onChange={setPaperRate} />
          </div>
          <p className="tool-window__result">
            <span className="tool-window__result-label">Per 1,000 labels</span>
            <span className="tool-window__result-value m-num" data-m="counter">
              {`₹ ${rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </p>
        </form>
      </div>

      <ul data-m="reveal" className="mx-auto mt-10 grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((tool) => (
          <li key={tool.href} data-m-child>
            <Link href={tool.href} data-m-card className="tool-directory">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{tool.tag}</span>
              <span className="mt-2 block font-display text-base font-semibold text-primary">{tool.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="tool-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </label>
  );
}
