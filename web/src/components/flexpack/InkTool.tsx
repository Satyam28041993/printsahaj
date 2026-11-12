"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ADHESIVE_DEFAULTS,
  adhesiveConsumption,
  computePouchCost,
  costInputFor,
  excelShortcutVsMassBalance,
  formatInr,
  formatNumber,
  inkConsumption,
  layerGsm,
  structureInputFor,
  type RateBasis,
} from "@/lib/flexpack";
import { Card, Notice, NumberField, Row, Segmented, Stat, Toggle } from "./ui";
import RateField from "./RateField";
import { useJob, useRateBook } from "./store";

interface ColourRow {
  uid: number;
  name: string;
  coverage: number;
  dryGsm: number;
}

const START_COLOURS: ColourRow[] = [
  { uid: 1, name: "Cyan", coverage: 30, dryGsm: 1.5 },
  { uid: 2, name: "Magenta", coverage: 30, dryGsm: 1.5 },
  { uid: 3, name: "Yellow", coverage: 30, dryGsm: 1.5 },
  { uid: 4, name: "Black", coverage: 20, dryGsm: 1.5 },
  { uid: 5, name: "White", coverage: 100, dryGsm: 2 },
];

export default function InkTool() {
  const { job } = useJob();
  const { book } = useRateBook();
  // Web width and running length follow the shared pouch job until the owner types their own.
  const jobRun = computePouchCost(costInputFor(job, book));
  const jobWidthMm = jobRun.geometry.slitWidthMm;
  const jobMetres = Math.round(jobRun.inputMetres);
  const [widthOverride, setWidthOverride] = useState<number | null>(null);
  const [metresOverride, setMetresOverride] = useState<number | null>(null);
  const widthMm = widthOverride ?? jobWidthMm;
  const metres = metresOverride ?? jobMetres;
  const [colours, setColours] = useState<ColourRow[]>(START_COLOURS);
  const [inkSolids, setInkSolids] = useState(30);
  const [bonds, setBonds] = useState(2);
  const [dryGsmPerBond, setDryGsmPerBond] = useState(2.5);
  const [adhesiveSolids, setAdhesiveSolids] = useState(30);
  const [basis, setBasis] = useState<RateBasis>("dry");
  const [showExcel, setShowExcel] = useState(false);

  const areaM2 = (widthMm / 1000) * metres;
  const ink = inkConsumption({
    areaM2,
    colours: colours.map((c) => ({ name: c.name, coveragePercent: c.coverage, dryGsm: c.dryGsm, ratePerKg: book.inkRatePerKgDry })),
    solidsPercent: inkSolids,
    rateBasis: basis,
  });
  const adhesive = adhesiveConsumption({
    areaM2,
    bonds,
    dryGsmPerBond,
    solidsPercent: adhesiveSolids,
    ratePerKg: book.adhesiveRatePerKgDry,
    rateBasis: basis,
  });
  const firstLayer = structureInputFor(job, book).layers[0];
  const firstGsm = firstLayer ? layerGsm(firstLayer) : 0;
  const excelInk = excelShortcutVsMassBalance(ink.averageDryGsm, book.inkRatePerKgDry, firstGsm);
  const update = (uid: number, changes: Partial<ColourRow>) => setColours((rows) => rows.map((row) => (row.uid === uid ? { ...row, ...changes } : row)));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <Card title="Print / lamination area" hint="Web jo machine se guzarta hai: width × running metres.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumberField label="Web width" unit="mm" value={widthMm} onChange={setWidthOverride} />
            <NumberField label="Running length" unit="metres" value={metres} onChange={setMetresOverride} />
            <div className="col-span-2 sm:col-span-1">
              <Stat label="Area" value={`${formatNumber(areaM2, 0)} m²`} />
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted">
            {widthOverride === null && metresOverride === null
              ? `Pouch Cost job se liya: slit ${formatNumber(jobWidthMm, 0)} mm × ${formatNumber(jobMetres, 0)} m (waste ke saath). Badalna ho to upar likho.`
              : `Aapke likhe hue numbers. Pouch Cost job: ${formatNumber(jobWidthMm, 0)} mm × ${formatNumber(jobMetres, 0)} m.`}
          </p>
          {(widthOverride !== null || metresOverride !== null) && (
            <button
              type="button"
              onClick={() => {
                setWidthOverride(null);
                setMetresOverride(null);
              }}
              className="mt-1 cursor-pointer text-xs font-semibold text-accent underline-offset-4 hover:underline"
            >
              Pouch Cost job ke numbers wapas lo
            </button>
          )}
        </Card>

        <Card title="Ink — colour by colour" hint="Dry kg = area × coverage % × dry GSM ÷ 1000, har colour ke liye.">
          <div className="space-y-3">
            {colours.map((colour, index) => (
              <div key={colour.uid} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2.5">
                <div>
                  <label htmlFor={`ink-name-${colour.uid}`} className="mb-1 block text-xs font-semibold text-primary">
                    Colour {index + 1}
                  </label>
                  <input
                    id={`ink-name-${colour.uid}`}
                    value={colour.name}
                    onChange={(event) => update(colour.uid, { name: event.target.value })}
                    className="w-full rounded-xl border border-hairline bg-elevated px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <NumberField label="Coverage" unit="%" value={colour.coverage} onChange={(value) => update(colour.uid, { coverage: value })} />
                <NumberField label="Dry laydown" unit="GSM" value={colour.dryGsm} onChange={(value) => update(colour.uid, { dryGsm: value })} />
                <button
                  type="button"
                  onClick={() => setColours((rows) => rows.filter((row) => row.uid !== colour.uid))}
                  disabled={colours.length <= 1}
                  aria-label={`Remove colour ${colour.name || index + 1}`}
                  className="mb-1 cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-primary disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setColours((rows) => [...rows, { uid: Math.max(0, ...rows.map((row) => row.uid)) + 1, name: "Spot", coverage: 20, dryGsm: 1.5 }])}
            disabled={colours.length >= 10}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-semibold text-primary hover:border-accent-line hover:bg-accent-weak disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add colour
          </button>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <NumberField label="Ink solids at press" unit="%" value={inkSolids} onChange={setInkSolids} help="Starting value — apni ink ki TDS / viscosity setting se lo." />
            <RateField rateKey="inkRatePerKgDry" label="Ink rate" unit={basis === "dry" ? "₹/kg dry" : "₹/kg wet"} />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted">
            Starting bands (GSMCalculator): gravure shallow 1.0–1.2, standard 1.2–1.8, heavy 1.8–2.5 GSM per colour; flexo 0.8–1.5.
            Coverage: text 20–35%, mixed 40–60%, heavy 60–80%, solid 90–100%. Yeh starting range hai — measured dry GSM better hai.
          </p>
        </Card>

        <Card title="Adhesive" hint="Dry kg = area × bonds × dry GSM ÷ 1000. Solvent-based: wet = dry ÷ solids. Solventless: wet = dry.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField label="Bonds" step={1} value={bonds} onChange={(value) => setBonds(Math.floor(value))} help="2-layer 1, 3-layer 2, 4-layer 3." />
            <NumberField label="Dry GSM / bond" value={dryGsmPerBond} onChange={setDryGsmPerBond} />
            <NumberField label="Solids at coating" unit="%" value={adhesiveSolids} onChange={setAdhesiveSolids} help="Solventless = 100." />
            <RateField rateKey="adhesiveRatePerKgDry" label="Adhesive rate" unit={basis === "dry" ? "₹/kg dry" : "₹/kg wet"} />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted">
            {ADHESIVE_DEFAULTS["solvent-based"].source} {ADHESIVE_DEFAULTS.solventless.source}
          </p>
        </Card>

        <Card title="Rate basis">
          <Segmented
            label="Rate basis"
            value={basis}
            onChange={setBasis}
            options={[
              { value: "dry", label: "₹ per dry kg" },
              { value: "wet", label: "₹ per wet kg" },
            ]}
          />
          <p className="mt-2 text-[11px] leading-snug text-muted">
            Dry: rate solids ka hai (structure builder yahi use karta hai). Wet: rate usi mixed ink / adhesive ka hai jo press par chal raha hai,
            upar diye solids % par. Rate book mein ek hi number hota hai — basis badalne par number khud convert nahi hota.
          </p>
          <div className="mt-4">
            <Toggle label="Excel-style shortcut bhi dikhao" checked={showExcel} onChange={setShowExcel} help="Purani sheet: ink RATE = GSM × ₹/kg. Sirf compare karne ke liye." />
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-5">
        <Card title="Ink">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Dry ink" value={`${formatNumber(ink.dryKg, 1)} kg`} note="stays on the film" />
            <Stat label="Wet ink" value={`${formatNumber(ink.wetKg, 1)} kg`} note={`at ${formatNumber(inkSolids, 0)}% solids`} />
          </div>
          <table className="mt-4 w-full text-xs">
            <caption className="sr-only">Ink by colour</caption>
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                <th scope="col" className="py-2 font-normal">Colour</th>
                <th scope="col" className="py-2 text-right font-normal">Dry kg</th>
                <th scope="col" className="py-2 text-right font-normal">Wet kg</th>
                <th scope="col" className="py-2 text-right font-normal">₹</th>
              </tr>
            </thead>
            <tbody>
              {ink.colours.map((colour, index) => (
                <tr key={index} className="border-b border-hairline last:border-b-0">
                  <th scope="row" className="py-1.5 text-left font-normal text-muted">{colour.name || `Colour ${index + 1}`}</th>
                  <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatNumber(colour.dryKg, 2)}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatNumber(colour.wetKg, 2)}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatInr(colour.cost, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <Row strong label="Ink cost" value={formatInr(ink.cost, 0)} />
            <Row label="Average dry ink over the web" value={`${formatNumber(ink.averageDryGsm, 2)} GSM`} sub="Yahi number structure builder ke 'Ink — average dry GSM' mein jata hai." />
          </div>
        </Card>

        <Card title="Adhesive">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Dry adhesive" value={`${formatNumber(adhesive.dryKg, 1)} kg`} note="stays in the laminate" />
            <Stat label="Wet adhesive" value={`${formatNumber(adhesive.wetKg, 1)} kg`} note={`at ${formatNumber(adhesiveSolids, 0)}% solids`} />
          </div>
          <div className="mt-3">
            <Row label="Solvent that flashes off" value={`${formatNumber(adhesive.volatileKg, 1)} kg`} />
            <Row label="Wet coat weight on the roller" value={`${formatNumber(adhesive.wetGsm, 2)} GSM`} sub="Machine setting ke liye — laminate GSM mein mat jodo." />
            <Row strong label="Adhesive cost" value={formatInr(adhesive.cost, 0)} />
          </div>
        </Card>

        {showExcel && (
          <Card title="Excel shortcut vs mass balance" hint="Per kg of first film, ink line.">
            <Row label="Excel: GSM × ₹/kg" value={formatInr(excelInk.excel)} />
            <Row label="Mass balance: (GSM ÷ first-film GSM) × ₹/kg" value={formatInr(excelInk.massBalance)} />
            <Row strong label="Excel overstates by" value={`${formatNumber(excelInk.overstatementFactor, 1)}×`} />
            <p className="mt-3 text-[11px] leading-snug text-muted">
              Sheet 1 kg first film ke area par poora GSM number hi kg maan leti hai. Asal mein us area par ink sirf GSM ÷ first-film GSM kg hoti hai
              (first film abhi {formatNumber(firstGsm)} GSM, structure builder se).
            </p>
          </Card>
        )}

        <Notice>Sirf dry kg laminate mein rehta hai. Wet kg drum se nikalta hai — purchase aur stock ke liye wahi dekho.</Notice>
      </div>
    </div>
  );
}
