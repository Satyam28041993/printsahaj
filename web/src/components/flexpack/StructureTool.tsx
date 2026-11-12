"use client";

import React from "react";
import { computeStructure, formatInr, formatNumber } from "@/lib/flexpack";
import { Card, Notice, Stat } from "./ui";
import ModeBar from "./ModeBar";
import StructureBuilder from "./StructureBuilder";
import { structureInputFor, useJob, useRateBook } from "./store";

export default function StructureTool() {
  const { job } = useJob();
  const { book } = useRateBook();
  const result = computeStructure(structureInputFor(job, book));
  const missingRate = result.lines.some((line) => line.kind === "film" && line.gsm > 0 && line.ratePerKg === 0);

  return (
    <div className="space-y-6">
      <ModeBar />
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StructureBuilder />
        </div>
        <div className="space-y-6 lg:sticky lg:top-28 lg:col-span-5">
          <Card title="Result" hint="Live — jaise hi layer badloge, yeh badlega.">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total GSM" value={formatNumber(result.totalGsm)} note="films + dry adhesive + dry ink" />
              <Stat label="Yield" value={formatNumber(result.yieldM2PerKg, 3)} note="m² per kg = 1000 ÷ GSM" />
              <Stat label="Material ₹/m²" value={formatInr(result.costPerM2, 3)} note="Σ GSM ÷ 1000 × ₹/kg" />
              <Stat label="Material ₹/kg" value={formatInr(result.costPerKg)} note="₹/m² ÷ (GSM ÷ 1000)" />
            </div>
            {missingRate && (
              <div className="mt-4">
                <Notice tone="warn">Kisi film ka rate 0 hai. Uska ₹/kg daalo, warna ₹/m² aur ₹/kg kam dikhega.</Notice>
              </div>
            )}
            <table className="mt-5 w-full text-xs">
              <caption className="sr-only">Layer-by-layer GSM and cost</caption>
              <thead>
                <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                  <th scope="col" className="py-2 font-normal">Line</th>
                  <th scope="col" className="py-2 text-right font-normal">GSM</th>
                  <th scope="col" className="py-2 text-right font-normal">₹/kg</th>
                  <th scope="col" className="py-2 text-right font-normal">₹/m²</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, index) => (
                  <tr key={index} className="border-b border-hairline last:border-b-0">
                    <th scope="row" className="py-1.5 text-left font-normal text-muted">{line.label}</th>
                    <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatNumber(line.gsm)}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-muted">{formatNumber(line.ratePerKg, 0)}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-primary">{formatNumber(line.costPerM2, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Notice>
            Rates tagged <strong>Example</strong> are illustrations from our worked example, not market prices. Densities are
            library starting values — supplier TDS ya weighed GSM hamesha better hai.
          </Notice>
        </div>
      </div>
    </div>
  );
}
