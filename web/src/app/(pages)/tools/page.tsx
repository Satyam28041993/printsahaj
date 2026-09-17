import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@content/tools";
import ToolVisual from "@/components/landing/visuals/ToolVisual";

export const metadata: Metadata = {
  title: "Tools",
  description: tools.intro,
};

export default function ToolsPage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-registration-marks opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[720px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Tool</p>
        <h1 className="mt-3 max-w-3xl font-display text-display-lg font-bold text-primary">
          {tools.heading}
        </h1>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{tools.intro}</p>

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {tools.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group surface-card flex h-full flex-col overflow-hidden rounded-3xl"
              >
                <div className="p-5 pb-0">
                  <ToolVisual kind={item.visual} />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    {item.category}
                  </p>
                  <h2 className="mt-3 font-display text-title font-semibold text-primary">
                    {item.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      {item.status}
                    </span>
                    <span className="text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
                      Open →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
