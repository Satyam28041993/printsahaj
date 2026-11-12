"use client";

import React, { useId, useState } from "react";
import type { RateTag } from "@/lib/flexpack";

export const inputClass =
  "w-full rounded-xl border border-hairline bg-elevated px-3 py-2.5 text-sm text-primary tabular-nums transition-colors hover:border-hairline-hover focus:border-accent focus:outline-none";

export function Card({ title, hint, children, action }: { title?: string; hint?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-hairline bg-elevated p-5 shadow-[var(--shadow-card)] sm:p-7">
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
          <div>
            {title && <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>}
            {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TAG_STYLE: Record<RateTag, { label: string; className: string }> = {
  example: { label: "Example", className: "border-dashed border-hairline-hover text-primary bg-sunken" },
  sourced: { label: "Sourced", className: "border-accent-line text-accent bg-accent-weak" },
  blank: { label: "Enter yours", className: "border-hairline text-faint" },
  owner: { label: "Your rate", className: "border-accent-line text-accent" },
};

export function Tag({ tag }: { tag: RateTag }) {
  const style = TAG_STYLE[tag];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.1em] ${style.className}`}>
      {style.label}
    </span>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  help?: React.ReactNode;
  tag?: RateTag;
  step?: number | "any";
  min?: number;
  /** Show an empty box instead of 0 (for "enter your rate" fields). */
  blankZero?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

/** Labelled numeric input. Keeps the typed text while focused so "2." and "" behave. */
export function NumberField({ label, value, onChange, unit, help, tag, step = "any", min = 0, blankZero, disabled, compact }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (blankZero && value === 0 ? "" : String(value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className={`font-semibold text-primary ${compact ? "text-[11px]" : "text-xs"}`}>
          {label}
          {unit && <span className="font-normal text-faint"> ({unit})</span>}
        </label>
        {tag && <Tag tag={tag} />}
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        disabled={disabled}
        value={shown}
        placeholder={blankZero ? "0" : undefined}
        aria-describedby={help ? `${id}-help` : undefined}
        onFocus={() => setDraft(shown)}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = Number(event.target.value);
          onChange(Number.isFinite(parsed) && parsed >= min ? parsed : 0);
        }}
        className={`${inputClass} disabled:opacity-50`}
      />
      {help && (
        <p id={`${id}-help`} className="mt-1 text-[11px] leading-snug text-muted">
          {help}
        </p>
      )}
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options, help }: { label: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[]; help?: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-primary">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help && <p className="mt-1 text-[11px] leading-snug text-muted">{help}</p>}
    </div>
  );
}

export function Segmented<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-hairline bg-sunken p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value ? "bg-[var(--pill-bg)] text-[var(--pill-fg)]" : "text-muted hover:text-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (checked: boolean) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--accent)]" />
      <label htmlFor={id} className="cursor-pointer text-sm text-primary">
        {label}
        {help && <span className="block text-[11px] leading-snug text-muted">{help}</span>}
      </label>
    </div>
  );
}

export function Row({ label, value, strong, sub }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; sub?: React.ReactNode }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-b-0 ${strong ? "font-semibold" : ""}`}>
      <span className={`text-xs ${strong ? "text-primary" : "text-muted"}`}>
        {label}
        {sub && <span className="block text-[11px] font-normal text-faint">{sub}</span>}
      </span>
      <span className="shrink-0 font-mono text-sm tabular-nums text-primary">{value}</span>
    </div>
  );
}

export function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-sunken p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-primary">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-snug text-muted">{note}</p>}
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <p
      role={tone === "warn" ? "alert" : undefined}
      className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${
        tone === "warn" ? "border-[var(--danger)] text-primary" : "border-hairline bg-sunken text-muted"
      }`}
    >
      {tone === "warn" && <strong className="font-semibold text-[var(--danger)]">Check: </strong>}
      {children}
    </p>
  );
}
