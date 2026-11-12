"use client";

import React, { useState } from "react";
import { formatInr, formatNumber } from "@/lib/flexpack";

export interface BreakdownPart {
  id: string;
  label: string;
  amount: number;
  /** Fixed categorical slot (1–7). Colour follows the cost head, never its rank. */
  slot: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * One stacked bar: how the ex-GST selling price splits into cost heads.
 * The table underneath is the accessible view — every value is readable without colour.
 */
export default function BreakdownChart({ parts, title, perPieces }: { parts: BreakdownPart[]; title: string; perPieces: number }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = parts.filter((part) => part.amount > 0);
  const total = shown.reduce((sum, part) => sum + part.amount, 0);
  if (total <= 0) return null;
  return (
    <figure>
      <figcaption className="mb-2 text-xs font-semibold text-primary">{title}</figcaption>
      <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-md" role="img" aria-label={`${title}. ${shown.map((p) => `${p.label} ${formatNumber((p.amount / total) * 100, 1)} percent`).join(", ")}.`}>
        {shown.map((part) => (
          <span
            key={part.id}
            onMouseEnter={() => setActive(part.id)}
            onMouseLeave={() => setActive(null)}
            title={`${part.label}: ${formatInr(part.amount, 0)} (${formatNumber((part.amount / total) * 100, 1)}%)`}
            style={{ width: `${(part.amount / total) * 100}%`, background: `var(--fp-s${part.slot})`, opacity: active && active !== part.id ? 0.45 : 1 }}
            className="h-full min-w-[3px] transition-opacity"
          />
        ))}
      </div>
      <table className="mt-3 w-full text-xs">
        <thead className="sr-only">
          <tr>
            <th scope="col">Cost head</th>
            <th scope="col">Amount</th>
            <th scope="col">Per pouch</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((part) => (
            <tr
              key={part.id}
              onMouseEnter={() => setActive(part.id)}
              onMouseLeave={() => setActive(null)}
              className={`border-b border-hairline last:border-b-0 ${active === part.id ? "bg-sunken" : ""}`}
            >
              <th scope="row" className="py-1.5 text-left font-normal text-muted">
                <span aria-hidden="true" className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: `var(--fp-s${part.slot})` }} />
                {part.label}
              </th>
              <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatInr(part.amount, 0)}</td>
              <td className="hidden py-1.5 text-right font-mono tabular-nums text-muted sm:table-cell">{perPieces > 0 ? formatInr(part.amount / perPieces, 3) : "—"}</td>
              <td className="w-14 py-1.5 text-right font-mono tabular-nums text-muted">{formatNumber((part.amount / total) * 100, 1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
