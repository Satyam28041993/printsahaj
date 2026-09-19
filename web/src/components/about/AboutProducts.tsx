"use client";

import React from "react";
import Link from "next/link";
import ProductVisual from "@/components/landing/visuals/ProductVisual";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutProducts() {
  const copy = about.products;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <AboutSection labelledBy="about-products-heading" className="about-section--quiet">
      <div ref={revealRef}>
        <div className="max-w-[42rem]">
          <h2
            data-reveal
            id="about-products-heading"
            className="font-display text-display-md font-bold text-primary"
          >
            {copy.heading}
          </h2>
          <p data-reveal className="mt-4 text-body-lg leading-relaxed text-muted">
            {copy.supporting}
          </p>
        </div>

        <article data-reveal className="about-featured">
          <div className="about-featured__visual">
            <ProductVisual name={copy.featured.name} size="lg" />
          </div>
          <div className="about-featured__copy">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {copy.featured.status}
            </p>
            <h3 className="mt-3 font-display text-display-sm font-semibold text-primary">
              {copy.featured.name}
            </h3>
            <p className="mt-4 max-w-[36rem] text-base leading-relaxed text-muted">
              {copy.featured.description}
            </p>
            <Link href={copy.featured.href} className="about-text-link mt-6 inline-flex">
              View product
            </Link>
          </div>
        </article>

        <ul data-reveal className="about-product-row">
          {copy.supportingItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="about-product-ref">
                <span className="about-product-ref__meta">{item.status}</span>
                <span className="about-product-ref__name">{item.name}</span>
                <span className="about-product-ref__desc">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p data-reveal className="mt-12">
          <Link href={copy.cta.href} className="about-text-link">
            {copy.cta.label}
          </Link>
        </p>
      </div>
    </AboutSection>
  );
}
