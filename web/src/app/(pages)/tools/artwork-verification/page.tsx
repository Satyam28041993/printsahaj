import Link from "next/link";
import { artworkTool } from "@content/tools";

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

      <a
        href={artworkTool.openHref}
        className="mt-6 inline-flex rounded-full bg-teal-700 px-5 py-3 text-sm font-medium text-white hover:bg-teal-600"
      >
        {artworkTool.openLabel}
      </a>
    </div>
  );
}
