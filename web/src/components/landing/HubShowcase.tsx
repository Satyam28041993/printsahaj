import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { home } from "@content/home";

const NODES = [
  { key: "printverify", kind: "product" as const, index: 0 },
  { key: "flexora", kind: "product" as const, index: 1 },
  { key: "crm", kind: "product" as const, index: 2 },
  { key: "tools", kind: "tools" as const, index: 0 },
];

export default function HubShowcase() {
  const copy = home.ecosystem;
  const toolsHref = "/tools";

  return (
    <section className="relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8" aria-labelledby="ecosystem-heading">
      <div className="mx-auto max-w-7xl">
        <h2 id="ecosystem-heading" className="max-w-3xl font-display text-display-lg font-bold text-primary text-balance">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-xl text-body-lg text-muted">
          PrintSahaj, then the products and tools that exist on this site.
        </p>

        <div className="eco-tree mt-14">
          <div className="eco-tree__root">
            <Logo showWordmark={false} size="lg" instance="eco-mark" />
            <p className="mt-3 font-display text-title font-semibold text-primary">{copy.hub}</p>
          </div>
          <p className="eco-tree__branch">Products / Tools / Solutions</p>
          <ul className="eco-tree__nodes">
            {NODES.map((node) => {
              if (node.kind === "tools") {
                return (
                  <li key={node.key}>
                    <Link href={toolsHref} className="eco-tree__node">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Live</span>
                      <span className="mt-2 block font-display text-lg font-semibold text-primary">Live Tools</span>
                    </Link>
                  </li>
                );
              }
              const product = copy.products[node.index];
              if (!product) return null;
              return (
                <li key={node.key}>
                  <Link href={product.href} className="eco-tree__node">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{product.tag}</span>
                    <span className="mt-2 block font-display text-lg font-semibold text-primary">{product.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
