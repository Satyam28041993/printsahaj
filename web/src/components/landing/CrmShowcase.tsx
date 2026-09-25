"use client";

import React from "react";
import CtaButton from "./CtaButton";
import CrmWindow from "./visuals/CrmWindow";
import { useReveal } from "@/lib/useReveal";

/**
 * One CRM chapter. Copy is the existing public description — enquiry, quote,
 * follow-up — not a new module list.
 */
export default function CrmShowcase() {
  const revealRef = useReveal<HTMLDivElement>({ start: "top 82%" });

  return (
    <section aria-labelledby="crm-showcase-heading" className="relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
      <div ref={revealRef} className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
        <div data-reveal>
          <p className="story-kicker">CRM</p>
          <h2 id="crm-showcase-heading" className="mt-5 max-w-[16ch] font-display text-display-lg font-bold text-primary text-balance">
            Enquiry, quote and follow-up. One customer.
          </h2>
          <p className="mt-5 max-w-md text-body-lg text-muted">
            Enquiries, quotes and follow-ups for a customer, kept in one place — with the job beside them.
          </p>
          <div className="mt-8">
            <CtaButton href="/crm/" size="lg">
              See the CRM
            </CtaButton>
          </div>
        </div>
        <div data-reveal>
          <CrmWindow sequence labelledBy="crm-showcase-heading" />
        </div>
      </div>
    </section>
  );
}
