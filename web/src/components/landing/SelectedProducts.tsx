import React from "react";
import Link from "next/link";
import Section from "./Section";
import CtaButton from "./CtaButton";
import InView from "./visuals/InView";
import ProductVisual from "./visuals/ProductVisual";
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
        <InView className="stagger-in mt-10 grid gap-4 md:grid-cols-2">
          {copy.items.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              className="group surface-card flex h-full flex-col overflow-hidden rounded-2xl"
            >
              <div className="p-5 pb-0 sm:p-6 sm:pb-0">
                <ProductVisual name={product.name} />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
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
                <p className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-accent">
                  Explore
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </InView>
        <div className="mt-10">
          <CtaButton href={copy.cta.href} variant="ghost">
            {copy.cta.label}
          </CtaButton>
        </div>
      </div>
    </Section>
  );
}
