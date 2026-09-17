"use client";

import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ProductVisual from "./visuals/ProductVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

/**
 * Products as two tinted panels, each led by its own product visual.
 *
 * This is the page's second card format on purpose: the pillars above are
 * copy-led with the UI cropped at the edge, these are visual-led with the copy
 * beside them. Two products should not look like four capabilities.
 */

const TINTS = ["teal", "violet"] as const;

export default function SelectedProducts() {
  const copy = home.selectedProducts;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });

  return (
    <section
      aria-labelledby="products-heading"
      className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8"
    >
      <div ref={revealRef} className="mx-auto max-w-6xl">
        <h2
          data-reveal
          id="products-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p data-reveal className="mt-5 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>

        <div className="mt-14 space-y-8">
          {copy.items.map((product, index) => (
            <Link
              key={product.name}
              href={product.href}
              data-reveal
              className={`feature-card feature-card--${TINTS[index % TINTS.length]} group grid lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <ProductVisual name={product.name} size="lg" />
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <span className="w-fit rounded-full border border-[var(--tint-line)] bg-[var(--tint-weak)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--tint-ink)]">
                  {product.status}
                </span>
                <h3 className="mt-5 font-display text-display-md font-semibold text-primary">
                  {product.name}
                </h3>
                <p className="mt-4 text-body-lg text-muted">{product.positioning}</p>
                <p className="mt-6 text-sm text-[var(--tint-ink)]">
                  Explore
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div data-reveal className="mt-10">
          <CtaButton href={copy.cta.href} variant="ghost">
            {copy.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
