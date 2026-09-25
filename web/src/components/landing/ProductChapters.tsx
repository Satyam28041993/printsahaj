"use client";

import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ProductVisual from "./visuals/ProductVisual";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

export default function ProductChapters() {
  const revealRef = useReveal<HTMLDivElement>({ start: "top 80%" });
  const printVerify = home.selectedProducts.items.find((item) => item.name === "PrintVerify");
  const flexora = home.selectedProducts.items.find((item) => item.name === "Flexora");

  return (
    <div ref={revealRef}>
      {printVerify ? (
        <section aria-labelledby="printverify-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div data-reveal className="min-h-[280px]">
              <ProductVisual name="PrintVerify" size="lg" />
            </div>
            <div data-reveal>
              <p className="story-kicker">Product · {printVerify.status}</p>
              <h2 id="printverify-heading" className="mt-5 font-display text-display-lg font-bold text-primary">
                {printVerify.name}
              </h2>
              <p className="mt-5 max-w-md text-body-lg text-muted">{printVerify.positioning}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Artwork · Plate</p>
              <div className="mt-8">
                <CtaButton href={printVerify.href} variant="ghost">
                  Open PrintVerify
                </CtaButton>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {flexora ? (
        <section aria-labelledby="flexora-heading" className="relative px-5 py-[clamp(64px,8vw,104px)] sm:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
            <div data-reveal>
              <p className="story-kicker">{flexora.status}</p>
              <h2 id="flexora-heading" className="mt-4 font-display text-display-md font-semibold text-primary">
                {flexora.name}
              </h2>
              <p className="mt-4 max-w-sm text-muted">ERP + HRMS for flexographic label businesses.</p>
              <Link href={flexora.href} className="founder-linkedin mt-6">
                Flexora page
              </Link>
            </div>
            <div data-reveal className="min-h-[220px]">
              <ProductVisual name="Flexora" size="lg" />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
