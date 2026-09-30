"use client";

import React from "react";
import { Bell, Check, Sparkles } from "lucide-react";
import { LABEL_RATE_DEFAULTS, labelRatePerThousand } from "@/lib/labelRate";
import { homeShowcase, type ShowcaseVisualId } from "@content/homeShowcase";
import { results } from "@content/showcase";

/**
 * The right-hand device for each showcase tab: small HTML/CSS mock-ups that
 * theme with the tokens. Everything on screen is SAMPLE data written for this
 * page — no client name, logo, customer, contact, rate, PO or job number.
 * The last one is the real calculator.
 */

const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

function Browser({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dev">
      <div className="dev__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="dev__title">{title}</span>
      </div>
      <div className="dev__body">{children}</div>
    </div>
  );
}

function FlexoraUi() {
  const columns = [
    { name: "Order", cards: [["Sample order A", "40%"], ["Sample order B", "15%"]] },
    { name: "Job", cards: [["Sample job A", "70%"], ["Sample job B", "55%"]] },
    { name: "Dispatch", cards: [["Sample job C", "95%"], ["Sample job D", "100%"]] },
  ];
  return (
    <Browser title="Sample data · ERP">
      <div className="flex items-center gap-2">
        <span className="mu-badge">ERP</span>
        <span className="mu-badge" data-tone="info">HRMS</span>
        <span className="mu-skel ml-auto w-24" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {columns.map((column, c) => (
          <div key={column.name} className="grid content-start gap-2 rounded-xl bg-sunken p-2">
            <p className="mu-label">{column.name}</p>
            {column.cards.map(([name, width], i) => (
              <div key={name} className="mu-card mu-in grid gap-2" style={idx(c * 2 + i)}>
                <span className="truncate font-medium">{name}</span>
                <div className="mu-bar" style={{ "--w": width } as React.CSSProperties}>
                  <i />
                </div>
                <span className="mu-skel w-3/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mu-card mu-in mt-3 flex items-center gap-3" style={idx(6)}>
        <span className="mu-label">HRMS · sample</span>
        <span className="flex flex-1 items-end gap-1.5" aria-hidden="true">
          {[60, 85, 70, 95, 80, 55, 90].map((height, i) => (
            <i key={i} className="block flex-1 rounded-sm" style={{ height: height * 0.22, background: "var(--brand-gradient)", opacity: 0.85 }} />
          ))}
        </span>
      </div>
    </Browser>
  );
}

function CrmUi() {
  const rows: [string, string, "info" | "warn" | "ok"][] = [
    ["Sample customer A", "Enquiry", "info"],
    ["Sample customer B", "Quote sent", "warn"],
    ["Sample customer C", "Follow-up", "ok"],
  ];
  const steps = ["Enquiry received", "Quote prepared", "Follow-up scheduled"];
  return (
    <Browser title="Sample data · CRM">
      <div className="grid h-full grid-cols-[1fr_1.1fr] gap-3">
        <div className="grid content-start gap-2">
          <p className="mu-label">Enquiries</p>
          {rows.map(([name, stage, tone], i) => (
            <div key={name} className="mu-card mu-in grid gap-1.5" style={idx(i)}>
              <span className="font-medium">{name}</span>
              <span className="flex items-center gap-2">
                <span className="mu-badge" data-tone={tone}>{stage}</span>
                <span className="mu-skel w-10" />
              </span>
            </div>
          ))}
        </div>
        <div className="grid content-start gap-2 rounded-xl bg-sunken p-3">
          <p className="mu-label">Sample customer B</p>
          {steps.map((step, i) => (
            <div key={step} className="mu-in flex items-center gap-2.5 text-xs" style={idx(i + 2)}>
              <span
                className="grid h-5 w-5 flex-none place-items-center rounded-full text-white"
                style={{ background: i < 2 ? "var(--brand-gradient)" : "var(--border-hover)" }}
              >
                {i < 2 ? <Check size={11} /> : <Bell size={10} />}
              </span>
              <span className={i < 2 ? "text-primary" : "text-muted"}>{step}</span>
            </div>
          ))}
          <span className="mu-skel mt-2 w-full" />
          <span className="mu-skel w-2/3" />
        </div>
      </div>
    </Browser>
  );
}

function WebsitesUi() {
  return (
    <Browser title="Sample website">
      <div className="mu-scroll">
        <div className="flex items-center gap-2">
          <span className="mu-skel w-12" />
          <span className="mu-skel ml-auto w-8" />
          <span className="mu-skel w-8" />
          <span className="mu-skel w-8" />
        </div>
        <div className="mu-hero grid gap-2">
          <span className="mu-skel w-4/5" style={{ height: 12, background: "var(--text-primary)", opacity: 0.85 }} />
          <span className="mu-skel w-3/5" style={{ height: 12, background: "var(--text-primary)", opacity: 0.85 }} />
          <span className="mu-skel mt-1 w-2/3" />
          <span className="mt-2 inline-flex w-fit rounded-full bg-[var(--pill-bg)] px-3 py-1.5 text-[11px] font-medium text-[var(--pill-fg)]">
            Get a quote
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((n) => (
            <div key={n} className="mu-card grid gap-1.5">
              <span className="h-10 rounded-lg bg-sunken" />
              <span className="mu-skel w-full" />
              <span className="mu-skel w-2/3" />
            </div>
          ))}
        </div>
        <div className="mu-card grid gap-2">
          <p className="mu-label">Enquiry</p>
          <span className="h-7 rounded-lg border border-hairline bg-sunken" />
          <span className="h-7 rounded-lg border border-hairline bg-sunken" />
          <span className="inline-flex w-fit rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-contrast)]">
            Send enquiry
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="mu-skel w-full" />
          <span className="mu-skel w-2/3" />
        </div>
      </div>
    </Browser>
  );
}

function PrintVerifyUi() {
  const files = ["Artwork", "Approval sheet", "Plate files"];
  const rows = results.rows.slice(0, 3);
  const tone = { ok: "Clear", warn: "Look", bad: "Differs" } as const;
  return (
    <Browser title="Sample check">
      <div className="grid grid-cols-3 gap-2">
        {files.map((file, i) => (
          <div key={file} className="mu-card mu-in grid gap-1.5" style={idx(i)}>
            <span className="font-medium">{file}</span>
            <span className="mu-skel w-full" />
            <span className="mu-skel w-2/3" />
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        <p className="mu-label">Findings</p>
        {rows.map((row, i) => (
          <div key={row.label} className="mu-card mu-in grid gap-1" style={idx(i + 3)}>
            <span className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{row.label}</span>
              <span className="mu-badge" data-tone={row.tone}>{tone[row.tone]}</span>
            </span>
            <span className="line-clamp-2 text-[11px] text-muted">{row.message}</span>
          </div>
        ))}
      </div>
    </Browser>
  );
}

function AivyUi() {
  return (
    <div className="phone">
      <div className="phone__notch" aria-hidden="true" />
      <div className="phone__body">
        <p className="mu-label flex items-center gap-1.5">
          <Sparkles size={11} aria-hidden="true" /> Aivy · sample
        </p>
        <p className="mu-bubble mu-in" data-from="me" style={idx(0)}>
          Remind me to call the supplier tomorrow at 10.
        </p>
        <p className="mu-bubble mu-in" data-from="bot" style={idx(2)}>
          Done. Reminder set for tomorrow, 10:00.
        </p>
        <p className="mu-bubble mu-in" data-from="me" style={idx(4)}>
          What&apos;s on today?
        </p>
        <div className="mu-bubble mu-in grid gap-1.5" data-from="bot" style={idx(6)}>
          <span className="mu-label">Morning brief</span>
          <span className="flex items-center gap-1.5">
            <span className="mu-badge">3 tasks</span>
            <span className="mu-badge" data-tone="info">1 reminder</span>
          </span>
          <span className="mu-skel w-full" />
          <span className="mu-skel w-2/3" />
        </div>
      </div>
    </div>
  );
}

export type CalcState = Record<(typeof homeShowcase.calculator.fields)[number]["key"], string>;

export const CALC_INITIAL: CalcState = {
  labelW: String(LABEL_RATE_DEFAULTS.labelW),
  labelH: String(LABEL_RATE_DEFAULTS.labelH),
  gapAround: String(LABEL_RATE_DEFAULTS.gapAround),
  gapAcross: String(LABEL_RATE_DEFAULTS.gapAcross),
  paperRate: String(LABEL_RATE_DEFAULTS.paperRate),
};

const num = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/** The real calculator: same formula as /calculators and the LiveTool section. */
function CalculatorUi({ state, onChange }: { state: CalcState; onChange: (next: CalcState) => void }) {
  const { calculator } = homeShowcase;
  const rate = labelRatePerThousand({
    ...LABEL_RATE_DEFAULTS,
    labelW: num(state.labelW),
    labelH: num(state.labelH),
    gapAround: num(state.gapAround),
    gapAcross: num(state.gapAcross),
    paperRate: num(state.paperRate),
  });
  const money = (value: number) =>
    value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="dev">
      <div className="dev__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="dev__title">{calculator.title}</span>
      </div>
      <form className="dev__body" style={{ height: "auto" }} onSubmit={(event) => event.preventDefault()}>
        <div className="grid grid-cols-2 gap-2.5">
          {calculator.fields.map((field, i) => (
            <label key={field.key} className={`calc-field ${i === 4 ? "col-span-2" : ""}`}>
              <span>{field.label}</span>
              <span className="calc-field__box">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={state[field.key]}
                  onChange={(event) => onChange({ ...state, [field.key]: event.target.value })}
                />
                <small>{field.unit}</small>
              </span>
            </label>
          ))}
        </div>
        <p className="calc-result" role="status">
          <span className="mu-label">{calculator.resultLabel}</span>
          <strong>₹ {money(rate)}</strong>
        </p>
        <p className="mt-2.5 text-[11px] leading-snug text-faint">{calculator.note}</p>
      </form>
    </div>
  );
}

export default function MiniUi({
  id,
  calc,
  onCalcChange,
}: {
  id: ShowcaseVisualId;
  calc: CalcState;
  onCalcChange: (next: CalcState) => void;
}) {
  switch (id) {
    case "flexora":
      return <FlexoraUi />;
    case "crm":
      return <CrmUi />;
    case "websites":
      return <WebsitesUi />;
    case "printverify":
      return <PrintVerifyUi />;
    case "aivy":
      return <AivyUi />;
    case "calculator":
      return <CalculatorUi state={calc} onChange={onCalcChange} />;
  }
}
