import type { Metadata } from "next";
import Link from "next/link";
import { artworkTool } from "@content/tools";

export const metadata: Metadata = {
  title: artworkTool.name,
  description: artworkTool.summary,
};

export default function ArtworkVerificationToolPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <Link
        href={artworkTool.backHref}
        className="text-sm text-teal-700 hover:underline dark:text-teal-400"
      >
        ← {artworkTool.backLabel}
      </Link>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
        {artworkTool.kicker}
      </p>
      <h1 className="mt-3 font-display text-display-lg font-bold text-slate-900 dark:text-white">
        {artworkTool.name}
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        {artworkTool.summary}
      </p>

      <div className="mt-8">
        <a
          href={artworkTool.openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:from-emerald-400 hover:to-cyan-400 active:scale-95"
        >
          {artworkTool.openLabel}
          <span aria-hidden="true">→</span>
        </a>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {artworkTool.openNote}
        </p>
      </div>

      <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        {artworkTool.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-teal-600" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <p className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {artworkTool.note}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          {artworkTool.startHeading}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {artworkTool.startSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
