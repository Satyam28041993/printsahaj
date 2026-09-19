import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ToolVisual from "./visuals/ToolVisual";
import { home } from "@content/home";
import { tools } from "@content/tools";

function ProductFace({ name }: { name: string }) {
  if (name === "PrintVerify") {
    return (
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
        Artwork · plates · job sheet
      </p>
    );
  }
  if (name === "Flexora") {
    return (
      <div className="mt-3 flex gap-2" aria-hidden="true">
        {["Order", "Job", "System"].map((row) => (
          <span key={row} className="flex-1 border border-hairline px-2 py-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            {row}
          </span>
        ))}
      </div>
    );
  }
  return (
    <ul className="mt-3 space-y-1.5" aria-hidden="true">
      {["Enquiry", "Quote", "Follow-up"].map((row) => (
        <li key={row} className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>{row}</span>
          <span className="h-1 w-10 bg-hairline" />
        </li>
      ))}
    </ul>
  );
}

export default function HubShowcase() {
  const copy = home.ecosystem;
  const calculatorVisual = Object.fromEntries(tools.items.map((item) => [item.name, item.visual]));

  return (
    <section className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8" aria-labelledby="ecosystem-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="ecosystem-heading" className="max-w-3xl font-display text-display-lg font-bold text-primary text-balance">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>

        <div className="relative mt-14">
          <svg
            className="pointer-events-none absolute inset-x-[8%] top-[4.5rem] hidden h-24 w-[84%] lg:block"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="dash-flow" d="M8 32 C 20 8, 30 8, 50 20" stroke="var(--border)" strokeWidth="0.6" fill="none" />
            <path className="dash-flow" d="M50 20 C 70 8, 80 8, 92 32" stroke="var(--border)" strokeWidth="0.6" fill="none" />
            <path className="dash-flow" d="M50 20 V38" stroke="var(--border)" strokeWidth="0.6" fill="none" />
          </svg>

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <Link href={copy.products[0]?.href ?? "/products"} className="border border-hairline bg-elevated p-5 lg:mt-16">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{copy.products[0]?.tag}</p>
              <h3 className="mt-2 font-display text-title font-semibold text-primary">{copy.products[0]?.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{copy.products[0]?.description}</p>
              <ProductFace name={copy.products[0]?.name ?? ""} />
            </Link>

            <div className="flex flex-col items-center justify-center border border-hairline bg-base px-6 py-10 text-center">
              <Logo showWordmark={false} size="xl" instance="eco-mark" />
              <p className="mt-4 font-display text-title font-semibold text-primary">{copy.hub}</p>
              <p className="mt-2 max-w-[18ch] text-sm text-muted">{copy.hubLine}</p>
            </div>

            <Link href={copy.products[1]?.href ?? "/products"} className="border border-hairline bg-elevated p-5 lg:mt-16">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{copy.products[1]?.tag}</p>
              <h3 className="mt-2 font-display text-title font-semibold text-primary">{copy.products[1]?.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{copy.products[1]?.description}</p>
              <ProductFace name={copy.products[1]?.name ?? ""} />
            </Link>
          </div>

          {copy.products[2] ? (
            <div className="mt-6 flex justify-center">
              <Link href={copy.products[2].href} className="w-full max-w-xl border border-hairline bg-elevated p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{copy.products[2].tag}</p>
                <h3 className="mt-2 font-display text-title font-semibold text-primary">{copy.products[2].name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy.products[2].description}</p>
                <ProductFace name={copy.products[2].name} />
              </Link>
            </div>
          ) : null}
        </div>

        <ul className="mt-12 flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {copy.tools.map((node) => {
            const visual = calculatorVisual[node.name];
            return (
              <li key={node.name} className="min-w-[13.5rem] snap-start lg:min-w-0">
                <Link href={node.href} className="block h-full border border-hairline bg-elevated p-3">
                  {visual ? <ToolVisual kind={visual} /> : null}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{node.tag}</p>
                  <h3 className="mt-1 text-sm font-semibold text-primary">{node.name}</h3>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
