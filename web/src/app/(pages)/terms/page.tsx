"use client";

import React from "react";
import Link from "next/link";
import { Shield, FileText, CheckCircle2, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Effective Date: 18 August 2026 • Governing Law: Republic of India</p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Nature of Service: Decision-Support Only</h2>
            <p>
              PrintSahaj provides specialized computational utilities, packaging cost estimators, and algorithmic pre-press cross-verification tools designed for the printing and packaging industry.
            </p>
            <div className="bg-white dark:bg-slate-900 border border-amber-500/30 p-5 rounded-2xl text-xs space-y-2 text-slate-700 dark:text-slate-300 shadow-md">
              <strong className="text-amber-600 dark:text-amber-400">Crucial Operational Condition:</strong>
              <p>
                PrintSahaj is strictly a decision-support and consistency-checking tool. The Platform does not certify, approve, or warrant that any print job, separation PDF, plate set, or cylinder engraving is defect-free. The Platform never issues an automated "PASS", "APPROVED", or "CERTIFIED" status.
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                The final sign-off, plate exposure authorization, and press run initiation remain the 100% sole operational and legal responsibility of the human operator and the licensed converter.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Subscription & Per-Plant Licensing</h2>
            <p>
              To protect audit trail validity, PrintSahaj licenses are provisioned on a <strong>Per-Manufacturing-Plant / Per-Unit basis</strong>, allowing unlimited authorized operators within the designated facility. Sharing credentials across distinct legal entities or unaffiliated manufacturing units without prior consent is prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Customer Artworks & Confidentiality</h2>
            <p>
              The Converter and its clients retain 100% full intellectual property rights, copyright, and trademarks in all artwork files, dielines, and PDF separations. Uploaded verification files are processed in isolated memory environments and automatically purged per tenant settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Absolute Limitation of Commercial Liability</h2>
            <p>
              To the maximum extent permitted by Indian law, PrintSahaj and its operators shall NOT be liable for any direct, indirect, incidental, or commercial losses resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>Rejected print jobs, client reprint costs, or finished roll/sheet scrapping.</li>
              <li>Flexopolymer plate remake or photopolymer washing costs.</li>
              <li>Machine downtime, press standing charges, or missed dispatch penalties.</li>
              <li>Substrate, ink foil or lamination material wastage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Governing Jurisdiction</h2>
            <p>
              These terms are governed by the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in Mumbai / Thane / Palghar, Maharashtra, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
