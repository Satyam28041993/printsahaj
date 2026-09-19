"use client";

import React from "react";
import Link from "next/link";
import ProductVisual from "./visuals/ProductVisual";
import PillarScene from "./visuals/PillarScene";
import ToolVisual from "./visuals/ToolVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";
import { tools } from "@content/tools";

function ProofVisual({ visual }: { visual: (typeof home.proof.items)[number]["visual"] }) {
  if (visual === "printverify") return <ProductVisual name="PrintVerify" size="lg" />;
  if (visual === "flexora") return <ProductVisual name="Flexora" size="lg" />;
  if (visual === "crm") {
    return (
      <div className="min-h-[280px] h-full overflow-hidden border border-hairline bg-sunken">
        <PillarScene id="software" />
      </div>
    );
  }
  const liveTools = tools.items.filter((item) => item.category === "Calculator").slice(0, 3);
  return (
    <div className="grid min-h-[280px] grid-cols-3 gap-px bg-hairline">
      {liveTools.map((tool) => (
        <div key={tool.name} className="bg-sunken p-2">
          <ToolVisual kind={tool.visual} />
        </div>
      ))}
    </div>
  );
}

export default function ProductProof() {
  const copy = home.proof;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section aria-labelledby="proof-heading" className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div ref={revealRef} className="mx-auto max-w-7xl">
        <h2
          data-reveal
          id="proof-heading"
          className="max-w-3xl font-display text-display-lg font-bold text-primary text-balance"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>

        <ul className="mt-14 space-y-16">
          {copy.items.map((item, index) => (
            <li key={item.name} data-reveal>
              <Link
                href={item.href}
                className={`group grid items-center gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <ProofVisual visual={item.visual} />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-display-md font-semibold text-primary">{item.name}</h3>
                    {item.status ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 max-w-xl text-body-lg text-muted">{item.caption}</p>
                  <p className="mt-6 text-sm text-accent">
                    Open
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      {" →"}
                    </span>
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
