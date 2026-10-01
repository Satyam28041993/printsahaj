import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import ProductVisual from "./visuals/ProductVisual";
import { home } from "@content/home";

export default function ProductChapters() {
  const printVerify = home.selectedProducts.items.find((item) => item.name === "PrintVerify");
  const flexora = home.selectedProducts.items.find((item) => item.name === "Flexora");

  return (
    <div>
      {printVerify ? (
        <section aria-labelledby="printverify-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div data-m="reveal" data-m-card className="min-h-[280px]">
              <div data-m="parallax" data-m-speed="6" className="h-full min-h-[280px]">
                <ProductVisual name="PrintVerify" size="lg" />
              </div>
            </div>
            <div>
              <div data-m="reveal">
                <p data-m-child className="story-kicker">Product · {printVerify.status}</p>
              </div>
              <h2 id="printverify-heading" data-m="lines" className="mt-5 font-display text-display-lg font-bold text-primary">
                {printVerify.name}
              </h2>
              <div data-m="reveal">
                <p data-m-child className="mt-5 max-w-md text-body-lg text-muted">{printVerify.positioning}</p>
                <p data-m-child className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Artwork · Plate</p>
                <div data-m-child className="mt-8">
                  <CtaButton href={printVerify.href} variant="ghost">
                    Open PrintVerify
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {flexora ? (
        <section aria-labelledby="flexora-heading" className="relative px-5 py-[clamp(64px,8vw,104px)] sm:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
            <div>
              <div data-m="reveal">
                <p data-m-child className="story-kicker">{flexora.status}</p>
              </div>
              <h2 id="flexora-heading" data-m="lines" className="mt-4 font-display text-display-md font-semibold text-primary">
                {flexora.name}
              </h2>
              <div data-m="reveal">
                <p data-m-child className="mt-4 max-w-sm text-muted">ERP + HRMS for flexographic label businesses.</p>
                <Link data-m-child href={flexora.href} className="founder-linkedin mt-6">
                  Flexora page
                </Link>
              </div>
            </div>
            <div data-m="reveal" data-m-card className="m-glow min-h-[220px]">
              <div data-m="parallax" data-m-speed="6" className="h-full min-h-[220px]">
                <ProductVisual name="Flexora" size="lg" />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
