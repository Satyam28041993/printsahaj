import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ToolVisual from "./visuals/ToolVisual";
import { home } from "@content/home";
import { tools } from "@content/tools";

export default function SelectedTools() {
  const copy = home.toolsTeaser;

  return (
    <section aria-labelledby="tools-heading" className="band-elevated relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="tools-heading" className="font-display text-display-lg font-bold text-primary">
              {copy.heading}
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
          </div>
          <CtaButton href={copy.cta.href} variant="ghost">
            {copy.cta.label}
          </CtaButton>
        </div>
        <ul className="work-rail mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {tools.items.map((item) => (
            <li key={item.href} className="w-[min(100%,19rem)] shrink-0 snap-start">
              <Link href={item.href} className="group surface-card block h-full overflow-hidden rounded-3xl">
                <div className="p-4 pb-0">
                  <ToolVisual kind={item.visual} />
                </div>
                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-primary">{item.name}</h3>
                  <p className="mt-4 text-sm text-accent">
                    Open <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
