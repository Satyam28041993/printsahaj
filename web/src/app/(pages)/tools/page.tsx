import Link from "next/link";
import { tools } from "@content/tools";

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
        PrintSahaj
      </p>
      <h1 className="mt-3 font-display text-display-lg font-bold text-slate-900 dark:text-white">
        {tools.heading}
      </h1>
      <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
        {tools.intro}
      </p>

      <ul className="mt-10 space-y-4">
        {tools.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-teal-500/50 dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {item.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {item.summary}
              </p>
              <p className="mt-3 text-xs text-teal-700 dark:text-teal-400">
                {item.status}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
