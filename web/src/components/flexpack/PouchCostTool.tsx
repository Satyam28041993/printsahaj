"use client";

import React from "react";
import {
  CONVERSION_LABELS,
  CONVERSION_ORDER,
  EXCEL_DENSITIES,
  backSealAllowanceFor,
  checkRepeat,
  computeExcelJob,
  computePouchCost,
  computeSlabs,
  formatInr,
  formatInt,
  formatNumber,
  kanodiaRateFor,
  type ExcelMaterial,
  type OrderCost,
  type PouchCostInput,
  type PouchType,
} from "@/lib/flexpack";
import { Card, Notice, NumberField, Row, Segmented, Stat, Toggle } from "./ui";
import ModeBar from "./ModeBar";
import RateField from "./RateField";
import StructureBuilder from "./StructureBuilder";
import PouchDiagram from "./PouchDiagram";
import BreakdownChart, { type BreakdownPart } from "./BreakdownChart";
import { structureInputFor, useJob, useRateBook, type JobState } from "./store";
import type { RateBook } from "@/lib/flexpack";

const POUCH_TYPES: { value: PouchType; label: string; sub: string }[] = [
  { value: "three-side-seal", label: "3-side seal", sub: "3SS / sachet" },
  { value: "center-seal", label: "Center seal", sub: "Pillow" },
  { value: "stand-up", label: "Standy", sub: "Bottom gusset" },
];

const SLAB_QUANTITIES = [10_000, 25_000, 50_000, 100_000];

const EXCEL_MAP: Record<string, ExcelMaterial> = {
  pet: "PET",
  "met-pet": "MET PET",
  ldpe: "POLY",
  lldpe: "POLY",
  bopp: "BOPP",
  bopa: "BOPA",
  alu: "AL.FOIL",
};

export function costInputFor(job: JobState, book: RateBook): PouchCostInput {
  const gravure = job.process === "gravure";
  // A plain pouch never goes through the press: no ink, no cylinders, and no
  // printing conversion, print waste or print setup either.
  const stages = CONVERSION_ORDER.filter((id) => job.printed || id !== "printing");
  return {
    structure: structureInputFor(job, book, !job.printed),
    geometry: {
      type: job.pouchType,
      width: job.width,
      height: job.height,
      gusset: job.gusset,
      backSealAllowance: job.backSealAllowance,
      edgeTrimPerSide: book.edgeTrimMm,
      lanes: job.advanced ? job.lanes : 1,
      repeatGap: job.advanced ? job.repeatGap : 0,
      threeSideSealAcross: job.advanced ? job.threeSideSealAcross : "width",
    },
    quantity: job.quantity,
    waste:
      job.advanced && job.wasteMode === "stages"
        ? {
            mode: "stages",
            stages: stages.map((id) => ({ id, label: CONVERSION_LABELS[id], ...book.stageWaste[id] })),
          }
        : { mode: "simple", combinedPercent: book.combinedWastePercent, setupMetres: job.advanced ? job.simpleSetupMetres : 0 },
    conversion: stages.map((id) => ({ id, label: CONVERSION_LABELS[id], ...book.conversion[id] })),
    tooling: job.printed
      ? {
          faceLengthMm: job.faceLengthMm,
          circumferenceMm: job.circumferenceMm,
          colours: job.colours,
          ratePerCm2: gravure
            ? kanodiaRateFor(job.circumferenceMm, {
                rateBelow: book.gravureRateBelow,
                rateAbove: book.gravureRateAbove,
                thresholdCircumferenceMm: book.gravureThresholdMm,
              })
            : book.flexoPlateRate,
        }
      : null,
    hardware: [
      { id: "zipper", label: "Zipper", enabled: job.zipper, ratePerPiece: book.zipperPerPiece },
      { id: "spout", label: "Spout / cap", enabled: job.spout, ratePerPiece: book.spoutPerPiece },
      { id: "valve", label: "Valve", enabled: job.valve, ratePerPiece: book.valvePerPiece },
    ],
    packingPercent: book.packingPercent,
    profitPercent: book.profitPercent,
    gstPercent: book.gstPercent,
  };
}

function OrderColumn({ title, note, order, highlight }: { title: string; note: string; order: OrderCost; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-accent-line bg-accent-weak" : "border-hairline bg-sunken"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{title}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-primary">{formatInr(order.perPouch.cost)}</p>
      <p className="text-[11px] text-muted">cost per pouch · {note}</p>
      <div className="mt-3">
        <Row label="Per 1,000" value={formatInr(order.perPouch.costPer1000, 0)} />
        <Row label="Order cost" value={formatInr(order.costBeforeProfit, 0)} />
        <Row label="Selling price (ex-GST)" value={formatInr(order.perPouch.sellingPrice)} />
        <Row label="GST" value={formatInr(order.perPouch.gst)} />
        <Row strong label="Invoice price / pouch" value={formatInr(order.perPouch.invoicePrice)} />
      </div>
    </div>
  );
}

export default function PouchCostTool() {
  const { job, patch } = useJob();
  const { book } = useRateBook();
  const input = costInputFor(job, book);
  const r = computePouchCost(input);
  const gravure = job.process === "gravure";
  const repeat = checkRepeat(job.circumferenceMm, r.geometry.repeatMm);
  const first = r.firstOrder;
  const stageIds = CONVERSION_ORDER.filter((id) => job.printed || id !== "printing");

  const parts: BreakdownPart[] = [
    { id: "material", label: "Material (film in pouch + trim)", amount: r.material.net + r.material.trim, slot: 1 },
    { id: "conversion", label: "Conversion", amount: r.conversion.total, slot: 2 },
    { id: "tooling", label: gravure ? "Cylinders (first order)" : "Plates (first order)", amount: r.tooling.total, slot: 3 },
    { id: "hardware", label: "Zipper / spout", amount: r.hardware.total, slot: 4 },
    { id: "waste", label: "Process waste (film)", amount: r.material.processWaste, slot: 5 },
    { id: "packing", label: "Packing", amount: first.packing, slot: 6 },
    { id: "profit", label: "Profit", amount: first.profit, slot: 7 },
  ];

  const excelFilms = job.layers.map((layer) => ({ material: EXCEL_MAP[layer.materialId], microns: layer.thickness, ratePerKg: book.filmRates[layer.materialId] ?? 0 }));
  const excelPossible = job.pouchType === "three-side-seal" && excelFilms.every((film) => film.material);
  const excel = excelPossible
    ? computeExcelJob({
        films: excelFilms,
        inkGsm: job.printed ? job.inkDryGsm : 0,
        inkRatePerKg: book.inkRatePerKgDry,
        adhesiveGsm: job.bondDryGsm.slice(0, job.layers.length - 1).reduce((sum, gsm) => sum + gsm, 0),
        adhesiveRatePerKg: book.adhesiveRatePerKgDry,
        wastage: book.combinedWastePercent,
        wastageConvention: "percent",
        pouchWidth: job.width,
        pouchHeight: job.height,
        pouchingCharge: book.conversion.pouching.ratePer1000 / 1000,
        zipperCharge: job.zipper ? book.zipperPerPiece : 0,
        packing: book.packingPercent / 100,
        profit: book.profitPercent / 100,
      })
    : null;

  return (
    <div className="space-y-6">
      <ModeBar />
      <a
        href="#fp-result"
        className="sticky top-20 z-20 flex items-center justify-between gap-3 rounded-2xl border border-accent-line bg-elevated px-4 py-2.5 shadow-[var(--shadow-card)] lg:hidden"
      >
        <span className="text-[11px] text-muted">
          First <strong className="font-mono text-sm text-primary">{formatInr(r.firstOrder.perPouch.cost)}</strong>
          <span className="mx-2 text-faint">·</span>
          Repeat <strong className="font-mono text-sm text-primary">{formatInr(r.repeatOrder.perPouch.cost)}</strong>
          <span className="text-faint"> / pouch</span>
        </span>
        <span className="text-xs font-semibold text-accent">Breakdown ↓</span>
      </a>
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card title="1. Pouch type & size" hint="Outer size daalo — seal ke saath. Seal dobara mat jodo.">
            <div role="radiogroup" aria-label="Pouch type" className="grid grid-cols-3 gap-2.5">
              {POUCH_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={job.pouchType === type.value}
                  onClick={() => patch({ pouchType: type.value })}
                  className={`flex cursor-pointer flex-col items-center rounded-2xl border p-3 text-center transition-colors ${
                    job.pouchType === type.value ? "border-accent bg-accent-weak text-accent" : "border-hairline text-muted hover:border-hairline-hover"
                  }`}
                >
                  <PouchDiagram type={type.value} />
                  <span className="mt-1 text-xs font-semibold text-primary">{type.label}</span>
                  <span className="text-[10px] text-faint">{type.sub}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumberField label={job.pouchType === "center-seal" ? "Face width" : "Width W"} unit="mm" value={job.width} onChange={(value) => patch({ width: value })} />
              <NumberField
                label={job.pouchType === "center-seal" ? "Cut-off length" : "Height H"}
                unit="mm"
                value={job.height}
                onChange={(value) => patch({ height: value })}
                help={job.pouchType === "center-seal" ? "Dono cross seal ke saath." : undefined}
              />
              {job.pouchType === "stand-up" && (
                <NumberField
                  label="Gusset G (full, unfolded)"
                  unit="mm"
                  value={job.gusset}
                  onChange={(value) => patch({ gusset: value })}
                  help="Agar gusset 40+40 folded hai, to 80 likho."
                />
              )}
              {job.pouchType === "center-seal" && (
                <NumberField
                  label="Back seal — total web"
                  unit="mm"
                  value={job.backSealAllowance}
                  onChange={(value) => patch({ backSealAllowance: value })}
                  help="Starting default — change me (geometry-based, not sourced). Fin = 2 × seal width, lap = 1 × overlap."
                />
              )}
              <NumberField label="Quantity" unit="pouches" step={1000} value={job.quantity} onChange={(value) => patch({ quantity: value })} />
              <RateField rateKey="edgeTrimMm" label="Edge trim / side" unit="mm" />
            </div>
            {job.pouchType === "center-seal" && job.advanced && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Segmented
                  label="Back seal type"
                  value={job.backSealType}
                  onChange={(value) => patch({ backSealType: value, backSealAllowance: backSealAllowanceFor(value, 10) })}
                  options={[
                    { value: "fin", label: "Fin seal" },
                    { value: "lap", label: "Lap seal" },
                  ]}
                />
                <span className="text-[11px] text-muted">
                  Starting default — change me (geometry-based, not sourced). 10 mm seal: fin = 20 mm, lap = 10 mm. Apna total upar likho.
                </span>
              </div>
            )}
            {job.pouchType === "three-side-seal" && job.advanced && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold text-primary">Orientation</p>
                <Segmented
                  label="Orientation"
                  value={job.threeSideSealAcross}
                  onChange={(value) => patch({ threeSideSealAcross: value })}
                  options={[
                    { value: "width", label: "Width across web" },
                    { value: "height", label: "Height across web" },
                  ]}
                />
                <p className="mt-1.5 text-[11px] leading-snug text-muted">
                  Width across web (default, purani Excel sheet jaisa): slit = 2 × W, repeat = H. Height across web: slit = 2 × H, repeat = W.
                  Pouch area same rehta hai — sirf trim aur print repeat badalta hai.
                </p>
              </div>
            )}
            {job.advanced && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumberField label="Lanes (ups across)" step={1} min={1} value={job.lanes} onChange={(value) => patch({ lanes: Math.max(1, Math.floor(value)) })} />
                <NumberField label="Gap between pouches" unit="mm" value={job.repeatGap} onChange={(value) => patch({ repeatGap: value })} />
              </div>
            )}
            <div className="mt-4 rounded-2xl border border-hairline p-4">
              <Row label="Film area per pouch" value={`${formatNumber(r.geometry.pouchAreaM2, 4)} m²`} />
              <Row label="Slit / web width (with trim)" value={`${formatNumber(r.geometry.slitWidthMm, 0)} mm`} />
              <Row label="Repeat" value={`${formatNumber(r.geometry.repeatMm, 0)} mm`} />
              <Row label="Layout trim" value={`${formatNumber(r.geometry.trimShare * 100, 2)}%`} sub="Kharida hua film hai — waste % mein dobara nahi judta." />
            </div>
            {job.pouchType === "three-side-seal" && (
              <p className="mt-2 text-[11px] text-muted">
                3SS: do panel. Default slit = 2 × W + trim, repeat = H. Agar aapki machine par H web ke across chalta hai to Advanced mode mein Orientation badlo.
              </p>
            )}
          </Card>

          <StructureBuilder title="2. Structure" unprinted={!job.printed} />

          <Card title="3. Waste" hint="Process waste alag, layout trim alag. Yahan sirf process waste.">
            {job.advanced && (
              <div className="mb-4">
                <Segmented
                  label="Waste mode"
                  value={job.wasteMode}
                  onChange={(value) => patch({ wasteMode: value })}
                  options={[
                    { value: "simple", label: "One combined %" },
                    { value: "stages", label: "Stage-wise" },
                  ]}
                />
              </div>
            )}
            {job.advanced && job.wasteMode === "stages" ? (
              <div className="space-y-3">
                {stageIds.map((id) => (
                  <div key={id} className="grid grid-cols-2 gap-3">
                    <RateField rateKey={`stageWaste.${id}.runWastePercent`} label={`${CONVERSION_LABELS[id]} waste`} unit="%" />
                    <RateField rateKey={`stageWaste.${id}.setupMetres`} label="Setup" unit="metres" />
                  </div>
                ))}
                <Notice>
                  Last machine se peeche compound hota hai: input = output ÷ (1 − waste) + setup metres. Numbers RollSpec ke worked example ke
                  illustrative inputs hain — industry benchmark nahi. Published starting ranges: print 2–4%, lam 1–3%, slit 1–2%.
                </Notice>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <RateField rateKey="combinedWastePercent" label="Combined process waste" unit="%" showNote />
                {job.advanced && (
                  <NumberField label="Setup metres" unit="m" value={job.simpleSetupMetres} onChange={(value) => patch({ simpleSetupMetres: value })} help="Chhote job mein setup metres zyada asar karta hai." />
                )}
              </div>
            )}
          </Card>

          <Card title="4. Conversion" hint="Apne plant ke rate daalo. India ka koi bharosemand published ₹/kg schedule nahi hai.">
            <div className="space-y-3">
              {stageIds.map((id) => (
                <div key={id} className="grid grid-cols-2 gap-3">
                  <RateField rateKey={`conversion.${id}.ratePerKg`} label={CONVERSION_LABELS[id]} unit="₹/kg" />
                  <RateField rateKey={`conversion.${id}.ratePer1000`} label={`${CONVERSION_LABELS[id]}`} unit="₹/1,000 pcs" />
                </div>
              ))}
            </div>
            {!job.printed && <p className="mt-3 text-[11px] text-muted">Plain job hai, isliye printing ka conversion aur print waste nahi lag raha.</p>}
            <p className="mt-3 text-[11px] text-muted">₹/kg input kg par lagta hai (waste ke saath). ₹/1,000 order quantity par. Dono mein se jo aap use karte ho woh bharo.</p>
          </Card>

          <Card title="5. Cylinder / plate" hint="Tooling sirf first order par lagti hai. Repeat order mein nahi.">
            <Toggle label="Printed job" checked={job.printed} onChange={(checked) => patch({ printed: checked })} help="Plain pouch ho to band kar do — ink aur cylinder hat jayenge." />
            {job.printed && (
              <>
                <div className="mt-4">
                  <Segmented
                    label="Print process"
                    value={job.process}
                    onChange={(value) => patch({ process: value })}
                    options={[
                      { value: "gravure", label: "Gravure cylinders" },
                      { value: "flexo", label: "Flexo plates" },
                    ]}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <NumberField label="Colours" step={1} value={job.colours} onChange={(value) => patch({ colours: Math.floor(value) })} />
                  <NumberField label={gravure ? "Face length" : "Plate width"} unit="mm" value={job.faceLengthMm} onChange={(value) => patch({ faceLengthMm: value })} />
                  <NumberField label={gravure ? "Circumference" : "Plate repeat"} unit="mm" value={job.circumferenceMm} onChange={(value) => patch({ circumferenceMm: value })} />
                  {gravure ? (
                    <>
                      <RateField rateKey="gravureRateBelow" label={`Rate ≤ ${book.gravureThresholdMm} mm`} unit="₹/cm²" />
                      <RateField rateKey="gravureRateAbove" label={`Rate > ${book.gravureThresholdMm} mm`} unit="₹/cm²" />
                    </>
                  ) : (
                    <RateField rateKey="flexoPlateRate" label="Plate rate" unit="₹/cm²" showNote />
                  )}
                </div>
                {gravure && (
                  <p className="mt-2 text-[11px] leading-snug text-muted">
                    Source: Kanodia Gravure, retrieved 12 Nov 2026 — ₹2.10/cm² below 750 mm circumference, ₹2.30/cm² above.
                    Apne cylinder maker ka rate daalo.
                  </p>
                )}
                <div className="mt-3 space-y-2">
                  {job.faceLengthMm < r.geometry.slitWidthMm && (
                    <Notice tone="warn">Face length ({formatNumber(job.faceLengthMm, 0)} mm) slit width ({formatNumber(r.geometry.slitWidthMm, 0)} mm) se chhota hai.</Notice>
                  )}
                  {!repeat.isWholeMultiple && job.circumferenceMm > 0 && r.geometry.repeatMm > 0 && (
                    <Notice tone="warn">
                      Circumference {formatNumber(job.circumferenceMm, 0)} mm repeat {formatNumber(r.geometry.repeatMm, 0)} mm ka poora multiple nahi hai.
                      Nearest: {repeat.upsAround} × {formatNumber(r.geometry.repeatMm, 0)} = {formatNumber(repeat.nearestCircumferenceMm, 0)} mm.
                    </Notice>
                  )}
                  {repeat.isWholeMultiple && <Notice>{repeat.upsAround} repeat around the cylinder. Tooling: {formatNumber(r.tooling.areaCm2, 0)} cm² × {input.tooling ? formatInr(input.tooling.ratePerCm2) : ""} × {job.colours} = {formatInr(r.tooling.total, 0)}.</Notice>}
                </div>
              </>
            )}
          </Card>

          <Card title="6. Add-ons, packing, profit, GST" hint="Zipper / spout film layer nahi hai — per piece ₹ hai. Kuch bhi pehle se tick nahi hai jo aapne nahi chuna.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Toggle label="Zipper" checked={job.zipper} onChange={(checked) => patch({ zipper: checked })} />
                {job.zipper && <RateField rateKey="zipperPerPiece" label="Zipper" unit="₹/pc" />}
              </div>
              <div className="space-y-2">
                <Toggle label="Spout / cap" checked={job.spout} onChange={(checked) => patch({ spout: checked })} />
                {job.spout && <RateField rateKey="spoutPerPiece" label="Spout" unit="₹/pc" />}
              </div>
              <div className="space-y-2">
                <Toggle label="Valve" checked={job.valve} onChange={(checked) => patch({ valve: checked })} />
                {job.valve && <RateField rateKey="valvePerPiece" label="Valve" unit="₹/pc" />}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <RateField rateKey="packingPercent" label="Packing" unit="%" />
              <RateField rateKey="profitPercent" label="Profit" unit="%" />
              <RateField rateKey="gstPercent" label="GST" unit="%" />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Order: material + conversion + tooling + hardware → packing % → profit % → GST alag se. GST default 18% (HSN 3920 / 3921 / 3923).
              Foil ya paper-heavy pack alag ho sakta hai — HSN apne CA se confirm karo. Yeh tax advice nahi hai.
            </p>
          </Card>
        </div>

        <div id="fp-result" className="scroll-mt-36 space-y-6 lg:sticky lg:top-28 lg:col-span-5">
          <Card title="Cost per pouch" hint={`${formatInt(r.quantity)} pouches · ${formatNumber(r.structure.totalGsm)} GSM`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <OrderColumn title="First order" note={job.printed ? "tooling on" : "no tooling"} order={r.firstOrder} highlight />
              <OrderColumn title="Repeat order" note="tooling off" order={r.repeatOrder} />
            </div>
            {r.tooling.total > 0 && (
              <p className="mt-3 text-xs text-muted">
                {gravure ? "Cylinder" : "Plate"} share on the first order: <strong className="text-primary">{formatInr(r.toolingPerPouch)}</strong> per pouch — isiliye first aur repeat ka rate alag hona chahiye.
              </p>
            )}
            <div className="mt-5 border-t border-hairline pt-5">
              <BreakdownChart title="First order — where the ex-GST price goes" parts={parts} perPieces={r.quantity} />
            </div>
            <div className="mt-4 rounded-2xl border border-hairline p-4">
              <Row label="Ex-GST order value" value={formatInr(first.sellingPrice, 0)} />
              <Row label={`GST ${formatNumber(book.gstPercent, 0)}% (shown separately)`} value={formatInr(first.gst, 0)} />
              <Row strong label="Invoice total, first order" value={formatInr(first.invoiceTotal, 0)} />
            </div>
          </Card>

          <Card title="Film to buy">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Film per pouch" value={`${formatNumber(r.filmGramsPerPouch, 2)} g`} note="film only, no zipper" />
              <Stat label="Pouches / kg" value={formatNumber(r.pouchesPerKgFilm, 1)} note="film only" />
            </div>
            <div className="mt-4">
              <Row label="Film in pouches" value={`${formatNumber(r.netKg, 1)} kg`} />
              <Row label="+ Layout trim" value={`${formatNumber(r.goodKg - r.netKg, 1)} kg`} />
              <Row label="+ Process waste & setup" value={`${formatNumber(r.inputKg - r.goodKg, 1)} kg`} />
              <Row strong label="= Laminate to run" value={`${formatNumber(r.inputKg, 1)} kg`} sub={`${formatInt(r.inputMetres)} m × ${formatNumber(r.geometry.slitWidthMm, 0)} mm`} />
            </div>
          </Card>

          {job.advanced && (
            <Card title="Slab rates" hint="Same job, alag quantity. Selling price ex-GST, per pouch.">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                    <th scope="col" className="py-2 font-normal">Quantity</th>
                    <th scope="col" className="py-2 text-right font-normal">First order</th>
                    <th scope="col" className="py-2 text-right font-normal">Repeat</th>
                  </tr>
                </thead>
                <tbody>
                  {computeSlabs(input, SLAB_QUANTITIES).map((slab) => (
                    <tr key={slab.quantity} className="border-b border-hairline last:border-b-0">
                      <th scope="row" className="py-1.5 text-left font-normal text-muted">{formatInt(slab.quantity)}</th>
                      <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatInr(slab.first.sellingPrice)}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatInr(slab.repeat.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {job.advanced && (
            <Card title="Excel-style comparison" hint="Purani printer Excel sheet ka tarika — sirf compare karne ke liye, default nahi.">
              {excel ? (
                <>
                  <Row label="Laminate ₹/kg (Excel method)" value={formatInr(excel.costPerKg)} />
                  <Row label="Pouches / kg" value={formatNumber(excel.pouchesPerKg, 1)} />
                  <Row strong label="Final ₹/pouch (Excel method)" value={formatInr(excel.finalPerPouch, 4)} />
                  <div className="mt-3">
                    <Notice>
                      Old sheet shortcut: the ink and adhesive lines also include printing/lamination conversion charges, so with true dry
                      ₹/kg rates the result looks higher. Use it only to compare against old sheets.
                    </Notice>
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-muted">
                    Excel densities ({Object.entries(EXCEL_DENSITIES).filter(([name]) => name !== "MET PET").map(([name, density]) => `${name} ${density}`).join(", ")}),
                    ink / adhesive = GSM × ₹/kg, wastage material rate par, pouching = ₹/1,000 ÷ 1000, slit = 2 × W. Isme conversion ₹/kg,
                    cylinder, trim aur GST nahi hai.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted">
                  Excel sheet sirf 3-side seal aur PET / MET PET / POLY / BOPP / BOPA / Alu foil jaanti hai. Pouch type 3SS karo aur wahi films rakho to comparison dikhega.
                </p>
              )}
            </Card>
          )}

          <Card title="Quote PDF" hint="Abhi bana nahi hai.">
            <p className="text-xs leading-relaxed text-muted">
              Is costing ka quotation PDF (first vs repeat, GST alag, quantity slabs) yahan se banega. Yeh feature abhi planned hai — tab tak
              upar ka on-screen result use karo.
            </p>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-3 inline-flex cursor-not-allowed items-center rounded-full border border-dashed border-hairline-hover px-4 py-2 text-xs font-semibold text-faint"
            >
              Prepare quote PDF — coming
            </button>
          </Card>

          <Notice>
            <strong>Example</strong> tag wale rupees sirf arithmetic dikhane ke liye hain — market rate nahi. Apna rate likhte hi tag
            &ldquo;Your rate&rdquo; ho jata hai aur isi browser mein save rehta hai.
          </Notice>
        </div>
      </div>
    </div>
  );
}
