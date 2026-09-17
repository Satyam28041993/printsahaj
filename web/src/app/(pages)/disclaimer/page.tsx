"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, ArrowLeft } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Product Integrity & Scope
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Decision-Support Disclaimer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Core Principles of PrintSahaj Algorithmic Assistance</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl space-y-3">
            <h2 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              1. Never PASS / FAIL / APPROVED Output
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              PrintSahaj is built on strict pre-press audit principles. Our algorithms surface objective discrepancy counts, coordinate mappings, and single-plate dependency warnings. PrintSahaj does not certify or declare any print job as &quot;APPROVED&quot; or &quot;100% DEFECT-FREE&quot;.
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              The final physical authorization, plate exposure sign-off, and press cylinder mounting remain the sole legal responsibility of the converter.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. What Automation Does NOT Check</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Aesthetic Design Taste:</strong> Artistic font harmony, image cropping appeal, or brand creative vision.
              </li>
              <li>
                <strong>Delta-E Physical Color Matching:</strong> Physical ink viscosity, anilox cell volume transfer, or illumination spectrophotometry under D50/D65 light booths.
              </li>
              <li>
                <strong>Substrate Stretch & Mechanical Press Tension:</strong> Physical film web elongation during 150m/min flexo printing.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Rule Pack Provenance</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Statutory compliance packs (FSSAI, Legal Metrology, Pharma declarations) are based on published public gazette notifications. Converters are advised to review relevant notifications for their specific state jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
