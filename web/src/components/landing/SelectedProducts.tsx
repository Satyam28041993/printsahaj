import React from "react";
import Link from "next/link";
import Section from "./Section";
import CtaButton from "./CtaButton";
import { home } from "@content/home";

export default function SelectedProducts() {
  const copy = home.selectedProducts;

  return (
    <Section labelledBy="products-heading" padding="compact">
      <div>
        <h2
          id="products-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">
          {copy.supporting}
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {copy.items.map((product) => (
            <li key={product.name}>
              <Link
                href={product.href}
                className="surface-card block h-full rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-title font-semibold text-primary">
                    {product.name}
                  </h3>
                  <span className="shrink-0 rounded-full border border-accent-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                    {product.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {product.positioning}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <CtaButton href={copy.cta.href} variant="ghost">
            {copy.cta.label}
          </CtaButton>
        </div>
      </div>
    </Section>
  );
}
