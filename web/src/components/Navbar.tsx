"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  ShieldCheck,
  Users,
  Menu,
  X,
  ArrowRight,
  FileText,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full pt-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/80 dark:bg-[#070b12]/80 backdrop-blur-xl border border-white/10 dark:border-slate-800/80 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl transition-colors duration-200">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 dark:bg-slate-900/70 border border-white/5 dark:border-slate-800/60 rounded-full px-3 py-1.5 shadow-inner">
            <Link
              href="/calculators"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-400 hover:bg-white/10 dark:hover:bg-slate-800 transition"
            >
              Calculators Hub
            </Link>
            <Link
              href="/tools"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-400 hover:bg-white/10 dark:hover:bg-slate-800 transition"
            >
              Tools
            </Link>
            <Link
              href="/#community"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-400 hover:bg-white/10 dark:hover:bg-slate-800 transition"
            >
              Sourcing & Network
            </Link>
            <Link
              href="/disclaimer"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-pink-400 hover:bg-white/10 dark:hover:bg-slate-800 transition"
            >
              Trust & Policies
            </Link>
          </nav>

          {/* Action Button & Theme Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/10 dark:border-slate-800 bg-white/5 dark:bg-slate-900/80 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Toggle Theme"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>

            {/* AI Fiesta Style Shimmer CTA Button */}
            <Link
              href="/tools/artwork-verification"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
            >
              <span>PrintVerify</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/10 text-slate-300"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-300 hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-3 shadow-2xl">
          <Link
            href="/calculators"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            Calculators Hub (Indian Tools)
          </Link>
          <Link
            href="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Tools
          </Link>
          <Link
            href="/#community"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Community & Sourcing Network
          </Link>
          <Link
            href="/disclaimer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
          >
            <FileText className="w-4 h-4 text-pink-400" />
            Trust & Policies
          </Link>
          <div className="pt-2">
            <Link
              href="/tools/artwork-verification"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-full text-xs"
            >
              PrintVerify
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
