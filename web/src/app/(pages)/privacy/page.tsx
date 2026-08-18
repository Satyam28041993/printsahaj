"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft, Database, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Client Data Isolation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Data Privacy & Isolation Policy</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Strict Protection for FMCG & Pharma Packaging Artworks</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-cyan-500" />
              1. Trade Secret & Artwork Confidentiality
            </h2>
            <p>
              We understand that packaging artworks, unreleased FMCG brand designs, pharma formulations, and dieline geometries represent mission-critical trade secrets of converters and brand owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              2. Isolated Memory Processing & Auto-Purge
            </h2>
            <p>
              All PDF separations and composite proofs uploaded for verification are processed in ephemeral, isolated runtime memory. Files are never stored on public buckets and are automatically purged immediately after the discrepancy audit report is generated.
            </p>
          </section>

          <section className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                3. Absolute Guarantee: No AI Training on Customer Artworks
              </h3>
              <p>
                Customer artwork files, separation plates, spot colour mappings, and proprietary designs are <strong>NEVER</strong> used to train, fine-tune, or calibrate public or shared AI/ML models.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. On-Premises Deployment Option</h2>
            <p>
              For high-security pharmaceutical packaging printers and ISO-certified security printers, PrintSahaj provides localized on-premises Docker appliance deployments that operate 100% within your factory intranet air-gap.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
