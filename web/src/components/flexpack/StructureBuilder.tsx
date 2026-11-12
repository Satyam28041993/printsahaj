"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ADHESIVE_DEFAULTS,
  INK_SOURCE,
  MATERIALS,
  METAL_ADD_ON_SOURCE,
  STRUCTURE_PRESETS,
  computeStructure,
  formatInr,
  formatNumber,
  getMaterial,
  layerGsm,
  type AdhesiveType,
} from "@/lib/flexpack";
import { Card, NumberField, Notice, Row, SelectField, Segmented, inputClass } from "./ui";
import RateField from "./RateField";
import { layersFromPreset, makeLayer, structureInputFor, syncBonds, useJob, useRateBook, type JobLayer } from "./store";

const MAX_LAYERS = 6;

export default function StructureBuilder({ showRates = true, title = "Structure — layer by layer" }: { showRates?: boolean; title?: string }) {
  const { job, patch } = useJob();
  const { book } = useRateBook();
  const bonds = syncBonds(job.bondDryGsm, job.layers.length, job.adhesiveType);
  const result = computeStructure(structureInputFor(job, book));

  const setLayers = (layers: JobLayer[]) =>
    patch({ layers, bondDryGsm: syncBonds(job.bondDryGsm, layers.length, job.adhesiveType) });
  const updateLayer = (uid: string, changes: Partial<JobLayer>) =>
    setLayers(job.layers.map((layer) => (layer.uid === uid ? { ...layer, ...changes } : layer)));
  const changeMaterial = (uid: string, materialId: string) => {
    const current = job.layers.find((layer) => layer.uid === uid);
    const wasPaper = current ? getMaterial(current.materialId).kind === "paper" : false;
    const next = getMaterial(materialId);
    const fresh = makeLayer(materialId, next.kind === "paper" ? 50 : wasPaper ? next.typical[0] ?? 12 : current?.thickness ?? 12);
    updateLayer(uid, { ...fresh, uid });
  };
  const setAdhesiveType = (type: AdhesiveType) =>
    patch({ adhesiveType: type, bondDryGsm: bonds.map(() => ADHESIVE_DEFAULTS[type].dryGsm) });

  return (
    <Card
      title={title}
      hint="Film = micron × density. Paper = mill GSM. Har do film ke beech ek adhesive bond apne aap aata hai."
    >
      <div className="mb-5">
        <label htmlFor="fp-preset" className="mb-1 block text-xs font-semibold text-primary">
          Start from a common Indian structure
        </label>
        <select
          id="fp-preset"
          value=""
          onChange={(event) => {
            const preset = STRUCTURE_PRESETS.find((item) => item.id === event.target.value);
            if (preset) setLayers(layersFromPreset(preset));
          }}
          className={inputClass}
        >
          <option value="">Choose a preset… (fully editable after)</option>
          {STRUCTURE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.endUse} — {preset.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-muted">Presets are published specs, not a standard. Microns apne job ke hisaab se badlo.</p>
      </div>

      <ol className="space-y-3">
        {job.layers.map((layer, index) => {
          const material = getMaterial(layer.materialId);
          const paper = material.kind === "paper";
          const gsm = layerGsm(structureInputFor(job, book).layers[index]);
          return (
            <li key={layer.uid}>
              <div className="rounded-2xl border border-hairline bg-sunken p-3.5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                    Layer {index + 1}
                    {index === 0 ? " · outside" : index === job.layers.length - 1 ? " · sealant" : ""}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs tabular-nums text-primary">{formatNumber(gsm)} GSM</span>
                    <button
                      type="button"
                      onClick={() => setLayers(job.layers.filter((item) => item.uid !== layer.uid))}
                      disabled={job.layers.length <= 1}
                      aria-label={`Remove layer ${index + 1} (${material.label})`}
                      className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className={`grid grid-cols-2 gap-3 ${showRates ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
                  <SelectField
                    label="Film"
                    value={layer.materialId}
                    onChange={(value) => changeMaterial(layer.uid, value)}
                    options={MATERIALS.map((item) => ({ value: item.id, label: item.label }))}
                  />
                  <NumberField
                    label={paper ? "Mill GSM" : "Micron"}
                    value={layer.thickness}
                    onChange={(value) => updateLayer(layer.uid, { thickness: value })}
                  />
                  {!paper && (
                    <NumberField
                      label="Density"
                      unit="g/cc"
                      value={layer.density}
                      onChange={(value) => updateLayer(layer.uid, { density: value })}
                      disabled={!!layer.measuredGsm}
                    />
                  )}
                  {showRates && <RateField rateKey={`filmRates.${layer.materialId}`} label="Rate" unit="₹/kg" />}
                </div>
                {(job.advanced || material.metallised) && !paper && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {material.metallised && (
                      <NumberField
                        label="Metal add-on"
                        unit="GSM"
                        value={layer.metalAddOnGsm}
                        onChange={(value) => updateLayer(layer.uid, { metalAddOnGsm: value })}
                        disabled={!!layer.measuredGsm}
                      />
                    )}
                    {job.advanced && (
                      <NumberField
                        label="Measured GSM"
                        value={layer.measuredGsm ?? 0}
                        blankZero
                        onChange={(value) => updateLayer(layer.uid, { measuredGsm: value > 0 ? value : null })}
                      />
                    )}
                  </div>
                )}
                <p className="mt-2 text-[11px] leading-snug text-muted">
                  {paper ? material.source : `Density source: ${material.source}.`}
                  {material.note ? ` ${material.note}` : ""}
                  {material.metallised ? ` ${METAL_ADD_ON_SOURCE}` : ""}
                  {job.advanced && !paper ? " Measured GSM (weighed sample ya TDS) daaloge to micron × density ki jagah wahi chalega." : ""}
                </p>
              </div>
              {index < job.layers.length - 1 && (
                <div className="ml-4 mt-3 border-l-2 border-dashed border-hairline-hover pl-4">
                  <div className="grid max-w-xs grid-cols-1">
                    <NumberField
                      compact
                      label={`Adhesive bond ${index + 1} — dry`}
                      unit="GSM"
                      value={bonds[index]}
                      onChange={(value) => patch({ bondDryGsm: bonds.map((item, i) => (i === index ? value : item)) })}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => setLayers([...job.layers, makeLayer("ldpe", 50)])}
        disabled={job.layers.length >= MAX_LAYERS}
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-semibold text-primary hover:border-accent-line hover:bg-accent-weak disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add layer
      </button>

      <div className="mt-6 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-primary">Adhesive type</p>
            <Segmented
              label="Adhesive type"
              value={job.adhesiveType}
              onChange={setAdhesiveType}
              options={[
                { value: "solvent-based", label: "Solvent-based" },
                { value: "solventless", label: "Solventless" },
              ]}
            />
            <p className="mt-1.5 text-[11px] leading-snug text-muted">{ADHESIVE_DEFAULTS[job.adhesiveType].source}</p>
          </div>
          {showRates && <RateField rateKey="adhesiveRatePerKgDry" label="Adhesive rate (dry)" unit="₹/kg dry" />}
        </div>
        <div className="space-y-3">
          <NumberField
            label="Ink — average dry GSM"
            unit="GSM"
            value={job.inkDryGsm}
            onChange={(value) => patch({ inkDryGsm: value })}
            help={INK_SOURCE}
          />
          {showRates && <RateField rateKey="inkRatePerKgDry" label="Ink rate (dry)" unit="₹/kg dry" />}
        </div>
      </div>
      <div className="mt-4">
        <Notice>
          Sirf <strong>dry</strong> ink aur adhesive GSM mein judta hai. Wet coat weight (solvent ke saath) laminate mein nahi rehta —
          usse GSM mat badhao. Wet kg ke liye Ink &amp; Adhesive tool dekho.
        </Notice>
      </div>

      <div className="mt-5 rounded-2xl border border-hairline p-4">
        <Row label="Films" value={`${formatNumber(result.filmGsm)} GSM`} />
        <Row label={`Dry adhesive (${result.bondCount} bond${result.bondCount === 1 ? "" : "s"})`} value={`${formatNumber(result.adhesiveGsm)} GSM`} />
        <Row label="Dry ink" value={`${formatNumber(result.inkGsm)} GSM`} />
        <Row strong label="Total laminate" value={`${formatNumber(result.totalGsm)} GSM`} />
        {showRates && <Row label="Laminate material" value={`${formatInr(result.costPerKg)}/kg`} />}
      </div>
    </Card>
  );
}
