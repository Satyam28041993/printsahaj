"use client";

import React from "react";
import { defaultMetaFor, getRate, tagFor } from "@/lib/flexpack";
import { NumberField } from "./ui";
import { useRateBook } from "./store";

/** A number input bound to one rate-book key. Shows the Example / Sourced / Your rate tag. */
export default function RateField({ rateKey, label, unit, showNote, compact }: { rateKey: string; label: string; unit?: string; showNote?: boolean; compact?: boolean }) {
  const { book, setBookRate } = useRateBook();
  const tag = tagFor(book, rateKey);
  const meta = defaultMetaFor(rateKey);
  return (
    <NumberField
      label={label}
      unit={unit}
      value={getRate(book, rateKey)}
      onChange={(value) => setBookRate(rateKey, value)}
      tag={tag}
      blankZero={meta.tag === "blank"}
      compact={compact}
      help={showNote ? meta.note : undefined}
    />
  );
}
