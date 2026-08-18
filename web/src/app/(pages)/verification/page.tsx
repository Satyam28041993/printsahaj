"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Building2,
  Send,
  Sparkles,
  ArrowRight,
  FileText,
  Lock,
} from "lucide-react";

export default function VerificationPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    plantName: "",
    city: "Vasai-Virar",
    phone: "",
    processes: "Flexo Labels",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-16 transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <div className="max-w-7xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          Pre-Press Loss Prevention Engine
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Har Galti Plate Banne Se Pehle Pakdi Jayegi.
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Approved job sheet, composite artwork, aur vendor separation PDF ka automatic 3-way cross-check. No missing plates. No dropped text. No vendor liability disputes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="#trial-form"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-7 py-3.5 rounded-2xl text-base shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            Request 14-Day Plant Pilot
          </a>
          <a
            href="#pricing"
            className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold px-7 py-3.5 rounded-2xl text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            View Per-Plant Pricing
          </a>
        </div>
      </div>

      {/* 2. THE 3-STEP PIPELINE */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            The 3-Step Verification Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">From incoming client file to press floor sign-off.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/30">
                1
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">Incoming Artwork</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 1 — Pre-Quote Compliance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Client artwork ka automated check: spelling in 5 languages (English + Devanagari/regional), mandatory regulatory statements (FSSAI, Legal Metrology, Pharma), and barcode geometry.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li>✓ Multi-language spelling dictionary</li>
              <li>✓ Versioned statutory rule packs</li>
              <li>✓ Barcode decodability check</li>
            </ul>
          </div>

          {/* Step 2 (Core ROI) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 space-y-4 relative shadow-xl shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                2
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono border border-amber-500/30 font-bold">
                Core Engine (ROI)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 2 — Separation vs Job Spec</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Plate vendor ki multi-page separation PDF aur approved job sheet ka mathematical cross-check. Declared colours vs pages, spot mapping, drop text, aur gear teeth repeat ratio.
            </p>
            <ul className="text-xs text-amber-600 dark:text-amber-400 font-medium space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li>✓ Missing Plate & Varnish Detection</li>
              <li>✓ Single-Plate Dependency Warnings</li>
              <li>✓ Cylinder Repeat Constant (CP = 3.175 mm)</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                3
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">Press Floor</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 3 — Press-Side Inspection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Machine operator mobile/tablet camera se pehle printed pull ko scan karta hai. Validates ki sabhi 7 units mounted hain aur ink unit dry nahi chal rahi.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li>✓ Visual Plate Presence Validation</li>
              <li>✓ Operator Digital Sign-off</li>
              <li>✓ Physical Discrepancy Log</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. COMPARISON: PRINTSAHAJ VS GLOBALVISION VS MANUAL */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Why Indian Printers Choose PrintSahaj</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Built specifically for MSME converters — not western enterprise budgets.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-lg">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 font-bold">Feature</th>
                <th className="py-3.5 px-4 text-cyan-600 dark:text-cyan-400 font-black bg-cyan-500/10">PrintSahaj</th>
                <th className="py-3.5 px-4 text-slate-500 dark:text-slate-400">GlobalVision</th>
                <th className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Manual Eye Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">Monthly Cost (Per Plant)</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-500/5">₹2,500 – ₹5,000 / mo</td>
                <td className="py-3.5 px-4 text-slate-500">₹35,000 – ₹65,000 / mo</td>
                <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Cost of Rejected Runs</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">Indian Spot & Process Mapping</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-500/5">Native (P 7483 C, Gold, etc.)</td>
                <td className="py-3.5 px-4 text-slate-500">Generic / Complex</td>
                <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">Memory / Habit</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">Cross-Document Verification</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-500/5">Automated 3-Way Cross Check</td>
                <td className="py-3.5 px-4 text-slate-500">Requires Heavy Setup</td>
                <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400">Human Blindspots</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">Data Privacy & Auto-Purge</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-500/5">100% Isolated / On-Prem Option</td>
                <td className="py-3.5 px-4 text-slate-500">Cloud Enterprise</td>
                <td className="py-3.5 px-4 text-slate-500">Paper Sheets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. STRICT AUDIT INTEGRITY & DISCLAIMERS */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Product Principles & What is NOT Checked</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">We assist human decisions — we never replace the expert operator.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="font-bold text-amber-600 dark:text-amber-400">1. We NEVER Output PASS / FAIL / APPROVED:</div>
            <p className="text-slate-500 dark:text-slate-400">
              Technology surfaces discrepancy counts, missing plate alarms, and coordinate maps. The final plate exposure sign-off remains 100% human responsibility.
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-amber-600 dark:text-amber-400">2. Parameters NOT Checked by Automation:</div>
            <p className="text-slate-500 dark:text-slate-400">
              PrintSahaj does not inspect aesthetic design taste, Delta-E physical ink shade matching under light booths, or physical substrate tension stretch during high-speed printing.
            </p>
          </div>
        </div>
      </div>

      {/* 5. PRICING TIERS */}
      <div id="pricing" className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">Transparent Pricing</div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Per-Plant Pricing (Unlimited Operators)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">No per-user fees that force shared logins and destroy the QC audit trail.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Starter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For single flexo/offset line shops</p>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹ 2,500 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">✓ Step 2 (Separation Check)</li>
                <li className="flex items-center gap-2">✓ Up to 50 jobs / month</li>
                <li className="flex items-center gap-2">✓ PDF Audit Finding Reports</li>
                <li className="flex items-center gap-2">✓ 1 Manufacturing Plant</li>
              </ul>
            </div>
            <a
              href="#trial-form"
              className="block text-center w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
            >
              Start 14-Day Pilot
            </a>
          </div>

          {/* Standard */}
          <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between relative shadow-xl shadow-cyan-500/10">
            <div className="absolute -top-3.5 right-6 bg-cyan-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
              Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Standard</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For active multi-press converters</p>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹ 5,000 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2 font-bold text-cyan-600 dark:text-cyan-400">✓ Step 1 & 2 Automated Cross-Check</li>
                <li className="flex items-center gap-2">✓ Unlimited Jobs / Month</li>
                <li className="flex items-center gap-2">✓ Immutable Pre-Press Audit Trail</li>
                <li className="flex items-center gap-2">✓ Unlimited Authorized Operators</li>
                <li className="flex items-center gap-2">✓ Spot & Process Mapping Profiles</li>
              </ul>
            </div>
            <a
              href="#trial-form"
              className="block text-center w-full bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-white py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition"
            >
              Start 14-Day Free Pilot
            </a>
          </div>

          {/* Pro */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro / Multi-Plant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For group converters & plate makers</p>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₹ 10,000 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">✓ Step 1, 2 + Step 3 Mobile App</li>
                <li className="flex items-center gap-2">✓ Up to 3 Manufacturing Units</li>
                <li className="flex items-center gap-2">✓ Customer/Brand Portal Access</li>
                <li className="flex items-center gap-2">✓ Custom ERP / MIS Integration</li>
              </ul>
            </div>
            <a
              href="#trial-form"
              className="block text-center w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
            >
              Contact for Group Pilot
            </a>
          </div>
        </div>
      </div>

      {/* 6. PILOT BOOKING FORM */}
      <div id="trial-form" className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            No Credit Card Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Book a 14-Day On-Site Plant Pilot
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vasai-Virar, Palghar, Daman, Silvassa & Mumbai MMR converters get same-day configuration support.
          </p>
        </div>

        {formSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pilot Request Received!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Satyam Singh (Founder) will contact your pre-press team within 2 business hours to configure your test separation parser.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satyam Singh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Plant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prakruti Graphics"
                  value={formData.plantName}
                  onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Industrial Cluster / City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Vasai-Virar">Vasai-Virar (Sativali / Waliv / Golani)</option>
                  <option value="Palghar">Palghar / Boisar</option>
                  <option value="Daman-Silvassa">Daman / Silvassa / Vapi</option>
                  <option value="Mumbai-MMR">Mumbai MMR / Thane / Navi Mumbai</option>
                  <option value="Gujarat">Gujarat (Surat / Ahmedabad / Bharuch)</option>
                  <option value="Other">Other National Cluster</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Send className="w-4 h-4" />
              Submit Pilot Setup Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
