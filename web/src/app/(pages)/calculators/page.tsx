"use client";

import React, { useState } from "react";
import {
  Calculator,
  Layers,
  FileSpreadsheet,
  RotateCw,
  Box,
  Settings,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<
    "label-rate" | "gsm-weight" | "sheet-ups" | "gear-repeat" | "corrugated-bf"
  >("label-rate");

  // 1. Label Rate State
  const [labelW, setLabelW] = useState<number>(114);
  const [labelH, setLabelH] = useState<number>(76);
  const [gapAround, setGapAround] = useState<number>(3);
  const [gapAcross, setGapAcross] = useState<number>(3);
  const [paperRate, setPaperRate] = useState<number>(48); // ₹/sqm
  const [inkCostPer1k, setInkCostPer1k] = useState<number>(35); // ₹/1k pcs
  const [varnishCostPer1k, setVarnishCostPer1k] = useState<number>(15); // ₹/1k pcs
  const [wastagePercent, setWastagePercent] = useState<number>(12); // %
  const [orderQty, setOrderQty] = useState<number>(50000); // Labels

  // Math for Label Rate
  const areaPer1k =
    ((labelW + gapAcross) * (labelH + gapAround) * 1000) / 1000000;
  const rawPaperCost1k = areaPer1k * paperRate;
  const paperCost1k = rawPaperCost1k * (1 + wastagePercent / 100);
  const totalRatePer1k = paperCost1k + inkCostPer1k + varnishCostPer1k;
  const ratePerUnit = totalRatePer1k / 1000;
  const totalJobCost = (totalRatePer1k * orderQty) / 1000;

  // 2. GSM to Weight State
  const [sheetL, setSheetL] = useState<number>(20); // inches
  const [sheetW, setSheetW] = useState<number>(30); // inches
  const [gsm, setGsm] = useState<number>(300); // g/m²
  const [paperPricePerKg, setPaperPricePerKg] = useState<number>(75); // ₹/kg

  // Math for GSM (Indian Formula: (L in * W in * GSM) / 3100 = 500 sheets ream weight in kg)
  const reamWeightKg = (sheetL * sheetW * gsm) / 3100;
  const costPerReam = reamWeightKg * paperPricePerKg;
  const costPerSheet = costPerReam / 500;

  // 3. Indian Sheet Ups State
  const [selectedSheet, setSelectedSheet] = useState<string>("20x30");
  const [itemL, setItemL] = useState<number>(120); // mm
  const [itemW, setItemW] = useState<number>(90); // mm
  const [margin, setMargin] = useState<number>(15); // mm gripper/margin

  // Sheet sizes in mm
  const sheetSizesMm: Record<string, { l: number; w: number; name: string }> = {
    "19x29": { l: 737, w: 483, name: "Demy (19 × 29 in)" },
    "20x30": { l: 762, w: 508, name: "Double Crown (20 × 30 in)" },
    "23x36": { l: 914, w: 584, name: "Royal (23 × 36 in)" },
    "25x36": { l: 914, w: 635, name: "Large Post (25 × 36 in)" },
    "28x40": { l: 1016, w: 711, name: "Quad Crown (28 × 40 in)" },
  };

  const currentSheet = sheetSizesMm[selectedSheet] || sheetSizesMm["20x30"];
  const usableSheetL = Math.max(1, currentSheet.l - margin * 2);
  const usableSheetW = Math.max(1, currentSheet.w - margin * 2);

  // Layout 1: Straight (L on L, W on W)
  const upsL1 = Math.floor(usableSheetL / itemL);
  const upsW1 = Math.floor(usableSheetW / itemW);
  const totalUpsStraight = Math.max(0, upsL1 * upsW1);

  // Layout 2: Rotated (L on W, W on L)
  const upsL2 = Math.floor(usableSheetL / itemW);
  const upsW2 = Math.floor(usableSheetW / itemL);
  const totalUpsRotated = Math.max(0, upsL2 * upsW2);

  const bestUps = Math.max(totalUpsStraight, totalUpsRotated);
  const totalSheetArea = currentSheet.l * currentSheet.w;
  const utilizedArea = bestUps * (itemL * itemW);
  const efficiencyPercent = totalSheetArea > 0 ? (utilizedArea / totalSheetArea) * 100 : 0;

  // 4. Flexo Cylinder Repeat State (1/8" CP = 3.175mm)
  const [gearTeeth, setGearTeeth] = useState<number>(96); // Z
  const [plateThickness, setPlateThickness] = useState<number>(1.14); // mm photopolymer
  const repeatLengthMm = gearTeeth * 3.175;
  const repeatLengthInches = repeatLengthMm / 25.4;
  const pitchDiameterMm = repeatLengthMm / Math.PI;

  // 5. Corrugated Box BF State
  const [boxGsmTop, setBoxGsmTop] = useState<number>(180);
  const [boxGsmFlute, setBoxGsmFlute] = useState<number>(140);
  const [boxGsmBottom, setBoxGsmBottom] = useState<number>(180);
  const [targetBf, setTargetBf] = useState<number>(20); // Burst Factor

  const totalBoardGsm = boxGsmTop + boxGsmFlute * 1.45 + boxGsmBottom;
  const calculatedBurstingStrength = (totalBoardGsm * targetBf) / 1000;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12 transition-colors duration-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Free Indian Packaging & Pre-Press Tools
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Printing & Packaging Calculator Hub
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Tailored specifically for Indian converters: standard sheet sizes (Demy, Crown, Royal), 1/8" flexo repeats, ₹/sqm paper rates, and ream formulas.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("label-rate")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
            activeTab === "label-rate"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
              : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Label Rate & Matrix Costing
        </button>

        <button
          onClick={() => setActiveTab("gsm-weight")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
            activeTab === "gsm-weight"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
              : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          GSM to Ream & Sheet Weight
        </button>

        <button
          onClick={() => setActiveTab("sheet-ups")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
            activeTab === "sheet-ups"
              ? "bg-pink-500 text-white shadow-md shadow-pink-500/25"
              : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Indian Sheet Ups Planner
        </button>

        <button
          onClick={() => setActiveTab("gear-repeat")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
            activeTab === "gear-repeat"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <RotateCw className="w-4 h-4" />
          Flexo Cylinder Repeat (1/8" CP)
        </button>

        <button
          onClick={() => setActiveTab("corrugated-bf")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
            activeTab === "corrugated-bf"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
              : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Box className="w-4 h-4" />
          Corrugated Bursting Strength
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: LABEL RATE */}
        {activeTab === "label-rate" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-500" />
                  Label Rate & Matrix Costing Estimator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Roll labels costing based on Indian Chromo, TT, PP, PE paper rates (₹/sqm) + Matrix waste.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Label Width (mm)</label>
                  <input
                    type="number"
                    value={labelW}
                    onChange={(e) => setLabelW(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Label Height (mm)</label>
                  <input
                    type="number"
                    value={labelH}
                    onChange={(e) => setLabelH(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gap Around (mm)</label>
                  <input
                    type="number"
                    value={gapAround}
                    onChange={(e) => setGapAround(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gap Across (mm)</label>
                  <input
                    type="number"
                    value={gapAcross}
                    onChange={(e) => setGapAcross(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paper Rate (₹ / Sq. Mtr)</label>
                  <input
                    type="number"
                    value={paperRate}
                    onChange={(e) => setPaperRate(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ink Cost (₹ / 1k Pcs)</label>
                  <input
                    type="number"
                    value={inkCostPer1k}
                    onChange={(e) => setInkCostPer1k(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Varnish Cost (₹ / 1k Pcs)</label>
                  <input
                    type="number"
                    value={varnishCostPer1k}
                    onChange={(e) => setVarnishCostPer1k(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Wastage (%)</label>
                  <input
                    type="number"
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Order Quantity (Labels)</label>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Costing Breakdown</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">Calculated</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Sq. Mtr per 1,000 Labels:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{areaPer1k.toFixed(3)} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Paper Cost (₹ / 1,000):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹ {paperCost1k.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2.5 bg-slate-50 dark:bg-slate-950 px-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Rate per 1,000 Labels:</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">₹ {totalRatePer1k.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2.5 bg-slate-50 dark:bg-slate-950 px-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Cost per Single Label:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹ {ratePerUnit.toFixed(4)}</span>
                </div>
                <div className="flex justify-between py-3.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/40 px-4 rounded-2xl border border-cyan-500/30 mt-4">
                  <div>
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-bold uppercase">Total Job Value ({orderQty.toLocaleString()} Pcs)</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      ₹ {totalJobCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GSM TO WEIGHT */}
        {activeTab === "gsm-weight" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  GSM to Ream & Sheet Weight Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formula: (Length in × Width in × GSM) ÷ 3100 for 500 sheets ream.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Length (Inches)</label>
                  <input
                    type="number"
                    value={sheetL}
                    onChange={(e) => setSheetL(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Width (Inches)</label>
                  <input
                    type="number"
                    value={sheetW}
                    onChange={(e) => setSheetW(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paper GSM</label>
                  <input
                    type="number"
                    value={gsm}
                    onChange={(e) => setGsm(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paper Rate (₹ / kg)</label>
                  <input
                    type="number"
                    value={paperPricePerKg}
                    onChange={(e) => setPaperPricePerKg(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Weight & Cost Output</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">Indian Standard</span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Ream Weight (500 Sheets)</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{reamWeightKg.toFixed(2)} kg</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Cost per Ream</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹ {costPerReam.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Cost per Sheet</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹ {costPerSheet.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHEET UPS */}
        {activeTab === "sheet-ups" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-pink-500" />
                  Indian Standard Sheet Ups Planner
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mono carton layout optimizer for standard Indian sheet sizes.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Indian Sheet</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="19x29">Demy — 19 × 29 in (483 × 737 mm)</option>
                    <option value="20x30">Double Crown — 20 × 30 in (508 × 762 mm)</option>
                    <option value="23x36">Royal — 23 × 36 in (584 × 914 mm)</option>
                    <option value="25x36">Large Post — 25 × 36 in (635 × 914 mm)</option>
                    <option value="28x40">Quad Crown — 28 × 40 in (711 × 1016 mm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Margin / Gripper (mm)</label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Length (mm)</label>
                  <input
                    type="number"
                    value={itemL}
                    onChange={(e) => setItemL(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Width (mm)</label>
                  <input
                    type="number"
                    value={itemW}
                    onChange={(e) => setItemW(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Ups Optimization</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold border border-pink-500/30">Best Fit: {bestUps} Ups</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Layout 1 (Straight):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{totalUpsStraight} Ups</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Layout 2 (Rotated):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{totalUpsRotated} Ups</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Area Utilization:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{efficiencyPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GEAR REPEAT */}
        {activeTab === "gear-repeat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-emerald-500" />
                  Flexo Cylinder Teeth to Repeat (1/8 inch CP)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Standard Circular Pitch (CP = 3.175mm / 1/8 inch). Repeat (mm) = Teeth × 3.175.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gear Teeth (Z)</label>
                  <input
                    type="number"
                    value={gearTeeth}
                    onChange={(e) => setGearTeeth(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Plate Thickness (mm)</label>
                  <input
                    type="number"
                    value={plateThickness}
                    onChange={(e) => setPlateThickness(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Cylinder Specifications</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">Calculated</span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Repeat Length</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{repeatLengthMm.toFixed(3)} mm</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">= {repeatLengthInches.toFixed(3)} inches</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Pitch Diameter (PD)</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{pitchDiameterMm.toFixed(3)} mm</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CORRUGATED BF */}
        {activeTab === "corrugated-bf" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-purple-500" />
                  Corrugated Box Bursting Factor & Strength (BF)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3-Ply board bursting strength estimator with 1.45 flute take-up.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Top Liner GSM</label>
                  <input
                    type="number"
                    value={boxGsmTop}
                    onChange={(e) => setBoxGsmTop(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Flute GSM</label>
                  <input
                    type="number"
                    value={boxGsmFlute}
                    onChange={(e) => setBoxGsmFlute(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bottom Liner GSM</label>
                  <input
                    type="number"
                    value={boxGsmBottom}
                    onChange={(e) => setBoxGsmBottom(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paper BF</label>
                  <input
                    type="number"
                    value={targetBf}
                    onChange={(e) => setTargetBf(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Board Performance</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30">3-Ply Board</span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total 3-Ply Board GSM</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalBoardGsm.toFixed(1)} g/m²</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Bursting Strength (BS)</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{calculatedBurstingStrength.toFixed(2)} kg/cm²</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Section */}
      <div className="max-w-7xl mx-auto pt-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Indian Printing Industry Reference & Formulas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="font-bold text-sm text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Standard Indian Sheet Sizes
            </h3>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2 font-sans font-semibold">Name</th>
                  <th className="py-2">Inches</th>
                  <th className="py-2">mm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                <tr><td className="py-2 font-sans font-medium text-slate-900 dark:text-white">Demy</td><td className="text-cyan-600 dark:text-cyan-400">19 × 29 in</td><td>483 × 737 mm</td></tr>
                <tr><td className="py-2 font-sans font-medium text-slate-900 dark:text-white">Double Crown</td><td className="text-cyan-600 dark:text-cyan-400">20 × 30 in</td><td>508 × 762 mm</td></tr>
                <tr><td className="py-2 font-sans font-medium text-slate-900 dark:text-white">Royal</td><td className="text-cyan-600 dark:text-cyan-400">23 × 36 in</td><td>584 × 914 mm</td></tr>
                <tr><td className="py-2 font-sans font-medium text-slate-900 dark:text-white">Large Post</td><td className="text-cyan-600 dark:text-cyan-400">25 × 36 in</td><td>635 × 914 mm</td></tr>
                <tr><td className="py-2 font-sans font-medium text-slate-900 dark:text-white">Quad Crown</td><td className="text-cyan-600 dark:text-cyan-400">28 × 40 in</td><td>711 × 1016 mm</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Core Calculation Formulas
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Ream Weight (500 Sheets):</div>
                <div className="font-mono text-amber-600 dark:text-amber-400">Weight (kg) = (Length in × Width in × GSM) ÷ 3100</div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Flexo Cylinder Repeat (1/8 inch CP):</div>
                <div className="font-mono text-emerald-600 dark:text-emerald-400">Repeat (mm) = Teeth (Z) × 3.175 mm</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
