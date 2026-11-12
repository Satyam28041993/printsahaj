import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { flexpack } from "@content/flexpack";

export const metadata: Metadata = {
  title: "Flexible Packaging Calculators",
  description: flexpack.intro,
};

export default function FlexibleHubPage() {
  return (
    <>
      <header className="mb-10 mt-8 max-w-3xl">
        <h1 className="font-display text-display-lg font-bold text-primary">{flexpack.heading}</h1>
        <p className="mt-4 text-body-lg text-muted">{flexpack.intro}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {flexpack.tools.map((tool, index) => (
          <li key={tool.slug}>
            <Link href={tool.href} className="group surface-card flex h-full flex-col rounded-3xl p-6 sm:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">Tool {index + 1} · Live</p>
              <h2 className="mt-3 font-display text-title font-semibold text-primary">{tool.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tool.summary}</p>
              <dl className="mt-4 space-y-1 text-xs text-muted">
                <div className="flex gap-2">
                  <dt className="w-10 shrink-0 font-mono uppercase tracking-[0.1em] text-faint">In</dt>
                  <dd>{tool.inputs}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-10 shrink-0 font-mono uppercase tracking-[0.1em] text-faint">Out</dt>
                  <dd>{tool.outputs}</dd>
                </div>
              </dl>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-accent">
                Open
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={flexpack.rateBook.href}
        className="mt-4 flex items-center gap-4 rounded-3xl border border-hairline bg-elevated p-5 transition-colors hover:border-accent-line sm:p-6"
      >
        <BookOpen className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
        <span>
          <span className="block font-display text-base font-semibold text-primary">{flexpack.rateBook.name}</span>
          <span className="mt-0.5 block text-sm text-muted">{flexpack.rateBook.summary}</span>
        </span>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </Link>

      <section className="mt-14" aria-labelledby="fp-coming">
        <h2 id="fp-coming" className="font-display text-title font-semibold text-primary">
          {flexpack.comingHeading}
        </h2>
        <p className="mt-1 text-sm text-muted">{flexpack.comingNote}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flexpack.coming.map((tool) => (
            <li key={tool.name} className="rounded-2xl border border-dashed border-hairline-hover p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Coming</p>
              <p className="mt-1.5 text-sm font-semibold text-primary">{tool.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{tool.summary}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Label, sheet aur corrugated ke calculators{" "}
          <Link href="/calculators/" className="font-semibold text-accent underline-offset-4 hover:underline">
            Printing &amp; Packaging Calculator Hub
          </Link>{" "}
          mein hain.
        </p>
      </section>
    </>
  );
}
