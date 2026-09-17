"use client";

import React from "react";
import Link from "next/link";
import { Shield, MapPin, ExternalLink } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 text-sm transition-colors duration-200">
      {/* Top Banner / Disclaimer Note */}
      <div className="bg-slate-200/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-center md:text-left">
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Decision-Support Notice:</strong> PrintSahaj provides algorithmic consistency checks and packaging estimators. The final plate sign-off and press initiation remain the operator&apos;s sole legal responsibility.
            </span>
          </div>
          <Link
            href="/disclaimer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap"
          >
            Read Audit Disclaimer <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block py-1">
              <Logo size="xl" instance="legacy-footer" />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              India&apos;s dedicated digital platform for printing & packaging converters. Built to make estimation rapid, pre-press audits defect-free, and factory workflows sahaj.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                Vasai-Virar • Mumbai • India
              </span>
            </div>
          </div>

          {/* Quick Calculators */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs mb-4 tracking-wider uppercase">
              Calculators
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/calculators" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  Label Rate & Matrix Cost
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  GSM to Ream Weight (3100 Formula)
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  Indian Sheet Ups (Demy / Crown)
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  Flexo Cylinder Repeat (1/8&quot; CP)
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                  Corrugated Bursting Factor (BF)
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Products */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs mb-4 tracking-wider uppercase">
              Tools
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/tools" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
                  All tools
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/artwork-verification"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition"
                >
                  PrintVerify
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs mb-4 tracking-wider uppercase">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/terms" className="hover:text-pink-600 dark:hover:text-pink-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-pink-600 dark:hover:text-pink-400 transition">
                  Data Isolation & Confidentiality
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-pink-600 dark:hover:text-pink-400 transition">
                  Decision-Support Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-pink-600 dark:hover:text-pink-400 transition">
                  Zero AI Model Training Guarantee
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PrintSahaj. All rights reserved. Made for Indian Printers & Converters.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for the Indian packaging industry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
