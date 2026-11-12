"use client";

import React, { useState } from "react";
import {
  ALLIANCE_FLEXO_PLATE,
  KANODIA_CYLINDER,
  checkRepeat,
  formatInr,
  formatInt,
  formatNumber,
  kanodiaRateFor,
  spreadTooling,
  toolingCost,
} from "@/lib/flexpack";
import { Card, Notice, NumberField, Row, Segmented, Stat } from "./ui";
import RateField from "./RateField";
import { useJob, useRateBook } from "./store";

export default function CylinderTool() {
  const { job, patch } = useJob();
  const { book } = useRateBook();
  const [repeatMm, setRepeatMm] = useState(160);
  const [repeatOrders, setRepeatOrders] = useState(3);
  const gravure = job.process === "gravure";
  const rate = gravure
    ? kanodiaRateFor(job.circumferenceMm, {
        rateBelow: book.gravureRateBelow,
        rateAbove: book.gravureRateAbove,
        thresholdCircumferenceMm: book.gravureThresholdMm,
      })
    : book.flexoPlateRate;
  const tooling = toolingCost({ faceLengthMm: job.faceLengthMm, circumferenceMm: job.circumferenceMm, ratePerCm2: rate, colours: job.colours });
  const lifetimeQty = job.quantity * (1 + Math.max(0, Math.floor(repeatOrders)));
  const spread = spreadTooling(tooling.total, job.quantity, lifetimeQty);
  const repeat = checkRepeat(job.circumferenceMm, repeatMm);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <Card title="Cylinder / plate size" hint="Cost = face length (cm) × circumference (cm) × ₹/cm² × colours.">
          <Segmented
            label="Print process"
            value={job.process}
            onChange={(value) => patch({ process: value })}
            options={[
              { value: "gravure", label: "Gravure cylinders" },
              { value: "flexo", label: "Flexo plates" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumberField label={gravure ? "Face length" : "Plate width"} unit="mm" value={job.faceLengthMm} onChange={(value) => patch({ faceLengthMm: value })} help="Slit width + margin. Cylinder maker se confirm karo." />
            <NumberField label={gravure ? "Circumference" : "Plate repeat"} unit="mm" value={job.circumferenceMm} onChange={(value) => patch({ circumferenceMm: value })} />
            <NumberField label="Colours" step={1} value={job.colours} onChange={(value) => patch({ colours: Math.floor(value) })} />
            <NumberField label="Print repeat (one pouch)" unit="mm" value={repeatMm} onChange={setRepeatMm} help="Standy mein repeat = pouch width." />
          </div>
          <div className="mt-3">
            {repeat.isWholeMultiple ? (
              <Notice>{repeat.upsAround} repeat around — circumference theek hai.</Notice>
            ) : (
              job.circumferenceMm > 0 && repeatMm > 0 && (
                <Notice tone="warn">
                  Circumference repeat ka poora multiple nahi hai. Nearest: {repeat.upsAround} × {formatNumber(repeatMm, 0)} = {formatNumber(repeat.nearestCircumferenceMm, 0)} mm.
                </Notice>
              )
            )}
          </div>
        </Card>

        <Card title="Rate" hint="Sourced default hai — apne cylinder / plate maker ka rate likho.">
          {gravure ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <RateField rateKey="gravureRateBelow" label={`Up to ${book.gravureThresholdMm} mm`} unit="₹/cm²" />
                <RateField rateKey="gravureRateAbove" label={`Above ${book.gravureThresholdMm} mm`} unit="₹/cm²" />
                <RateField rateKey="gravureThresholdMm" label="Tier split" unit="mm circ." />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-muted">
                Source: {KANODIA_CYLINDER.source}, retrieved {KANODIA_CYLINDER.retrieved} — ₹{KANODIA_CYLINDER.rateBelow.toFixed(2)}/cm² below{" "}
                {KANODIA_CYLINDER.thresholdCircumferenceMm} mm circumference, ₹{KANODIA_CYLINDER.rateAbove.toFixed(2)}/cm² above. Ek supplier ka published rate hai, market average nahi.
                Exactly {KANODIA_CYLINDER.thresholdCircumferenceMm} mm ko yahan lower tier maana gaya hai.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <RateField rateKey="flexoPlateRate" label="Plate rate" unit="₹/cm²" />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-muted">
                ₹{ALLIANCE_FLEXO_PLATE.rate.toFixed(2)}/cm² is the pre-filled example in {ALLIANCE_FLEXO_PLATE.source} (retrieved {ALLIANCE_FLEXO_PLATE.retrieved}) — an example input, not a market survey.
              </p>
            </>
          )}
        </Card>

        <Card title="Spread over the order" hint="Tooling ek baar ka kharcha hai. Chhote first order par yeh film se bhi zyada ho sakta hai.">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="First order quantity" unit="pcs" step={1000} value={job.quantity} onChange={(value) => patch({ quantity: value })} />
            <NumberField label="Expected repeat orders" step={1} value={repeatOrders} onChange={setRepeatOrders} help="Same cylinders, same quantity har baar." />
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-5">
        <Card title="Tooling cost">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total tooling" value={formatInr(tooling.total, 0)} note={`${job.colours} colours`} />
            <Stat label="Per colour" value={formatInr(tooling.costPerColour, 0)} note={`${formatNumber(tooling.areaCm2, 0)} cm² × ${formatInr(rate)}`} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-accent-line bg-accent-weak p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">First order</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-primary">{formatInr(spread.perPieceFirstOrder, 3)}</p>
              <p className="text-[11px] text-muted">tooling per pouch</p>
            </div>
            <div className="rounded-2xl border border-hairline bg-sunken p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Repeat order</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-primary">{formatInr(0, 3)}</p>
              <p className="text-[11px] text-muted">same cylinders, no new tooling</p>
            </div>
          </div>
          <div className="mt-4">
            <Row label="Area of one cylinder / plate" value={`${formatNumber(tooling.areaCm2, 0)} cm²`} />
            <Row label="Rate applied" value={`${formatInr(rate)}/cm²`} />
            <Row label="Per 1,000 on the first order" value={formatInr(spread.perPieceFirstOrder * 1000, 0)} />
            <Row
              label={`If recovered over ${formatInt(lifetimeQty)} pcs`}
              sub={`first order + ${Math.max(0, Math.floor(repeatOrders))} repeat`}
              value={`${formatInr(spread.perPieceOverLife, 3)} / pouch`}
            />
          </div>
        </Card>
        <Notice>
          Quote mein first order aur repeat order ka rate alag dikhao. Poora pouch cost dekhne ke liye Pouch Cost tool kholo — wahan yahi size aur colours use hote hain.
        </Notice>
      </div>
    </div>
  );
}
