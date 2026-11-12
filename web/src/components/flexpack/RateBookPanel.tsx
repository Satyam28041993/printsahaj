"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { CONVERSION_LABELS, CONVERSION_ORDER, MATERIALS } from "@/lib/flexpack";
import { Card, Notice, Tag } from "./ui";
import RateField from "./RateField";
import { useRateBook } from "./store";

export default function RateBookPanel() {
  const { book, resetBook } = useRateBook();
  const films = MATERIALS.filter((material) => material.id !== "custom");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted" aria-live="polite">
          {book.savedAt
            ? `Saved in this browser · last change ${new Date(book.savedAt).toLocaleString("en-IN")}`
            : "Abhi default rates chal rahe hain. Jo bhi badloge, isi browser mein save ho jayega."}
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Saare rates wapas default par? Aapke likhe hue rates hat jayenge.")) resetBook();
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset to defaults
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-hairline bg-sunken px-4 py-3 text-xs text-muted">
        <span className="flex items-center gap-2"><Tag tag="example" /> illustration, not a market price</span>
        <span className="flex items-center gap-2"><Tag tag="sourced" /> published figure, source named</span>
        <span className="flex items-center gap-2"><Tag tag="blank" /> no trustworthy figure — type yours</span>
        <span className="flex items-center gap-2"><Tag tag="owner" /> you typed it</span>
      </div>

      <Card title="Film rates" hint="₹ per kg, jo aap kharidte ho. Hum film ke market price publish nahi karte.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {films.map((material) => (
            <RateField key={material.id} rateKey={`filmRates.${material.id}`} label={material.label} unit="₹/kg" />
          ))}
          <RateField rateKey="filmRates.custom" label="Custom film" unit="₹/kg" />
        </div>
      </Card>

      <Card title="Ink & adhesive" hint="₹ per dry kg — sirf solids ka rate.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <RateField rateKey="inkRatePerKgDry" label="Ink" unit="₹/kg dry" showNote />
          <RateField rateKey="adhesiveRatePerKgDry" label="Adhesive" unit="₹/kg dry" showNote />
        </div>
      </Card>

      <Card title="Conversion" hint="Apne plant ka rate. ₹/kg ya ₹/1,000 — jo aap use karte ho.">
        <div className="space-y-3">
          {CONVERSION_ORDER.map((id) => (
            <div key={id} className="grid grid-cols-2 gap-3 sm:max-w-xl">
              <RateField rateKey={`conversion.${id}.ratePerKg`} label={CONVERSION_LABELS[id]} unit="₹/kg" />
              <RateField rateKey={`conversion.${id}.ratePer1000`} label={CONVERSION_LABELS[id]} unit="₹/1,000 pcs" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Notice>
            India mein printing / lamination / slitting / pouching ka koi bharosemand published ₹/kg schedule nahi mila. Yahan ke numbers sirf
            worked example ke hain — apne rate se badlo.
          </Notice>
        </div>
      </Card>

      <Card title="Cylinder & plate">
        <div className="grid gap-3 sm:grid-cols-2">
          <RateField rateKey="gravureRateBelow" label={`Gravure, up to ${book.gravureThresholdMm} mm`} unit="₹/cm²" showNote />
          <RateField rateKey="gravureRateAbove" label={`Gravure, above ${book.gravureThresholdMm} mm`} unit="₹/cm²" />
          <RateField rateKey="flexoPlateRate" label="Flexo plate" unit="₹/cm²" showNote />
        </div>
      </Card>

      <Card title="Add-ons">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <RateField rateKey="zipperPerPiece" label="Zipper" unit="₹/pc" />
          <RateField rateKey="spoutPerPiece" label="Spout / cap" unit="₹/pc" />
          <RateField rateKey="valvePerPiece" label="Valve" unit="₹/pc" />
        </div>
      </Card>

      <Card title="Waste & trim">
        <div className="grid gap-3 sm:grid-cols-2">
          <RateField rateKey="combinedWastePercent" label="Combined process waste (Simple mode)" unit="%" showNote />
          <RateField rateKey="edgeTrimMm" label="Edge trim per side" unit="mm" showNote />
        </div>
        <p className="mb-2 mt-5 text-xs font-semibold text-primary">Stage-wise (Advanced mode)</p>
        <div className="space-y-3">
          {CONVERSION_ORDER.map((id) => (
            <div key={id} className="grid grid-cols-2 gap-3 sm:max-w-xl">
              <RateField rateKey={`stageWaste.${id}.runWastePercent`} label={`${CONVERSION_LABELS[id]} waste`} unit="%" />
              <RateField rateKey={`stageWaste.${id}.setupMetres`} label="Setup" unit="metres" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Stage numbers RollSpec ke worked example ke illustrative inputs hain — industry benchmark nahi. Published starting ranges
          (GSMCalculator): print 2–4%, lam 1–3%, slit 1–2%.
        </p>
      </Card>

      <Card title="Packing, profit, GST">
        <div className="grid gap-3 sm:grid-cols-3">
          <RateField rateKey="packingPercent" label="Packing" unit="%" />
          <RateField rateKey="profitPercent" label="Profit" unit="%" />
          <RateField rateKey="gstPercent" label="GST" unit="%" showNote />
        </div>
      </Card>
    </div>
  );
}
