import React from "react";
import CtaButton from "./CtaButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export default function HomeFinalCta() {
  const copy = home.finalCta;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="band-sunken cta-flip relative px-5 py-[clamp(96px,14vw,180px)] sm:px-8"
      data-m="flip"
    >
      <span className="cta-flip__bg" data-m-flip-bg aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <div>
          <h2
            data-m="lines"
            id="final-cta-heading"
            className="max-w-[16ch] font-display text-display-xl font-bold text-primary text-balance"
          >
            {copy.heading}
          </h2>
          <p data-m="reveal" className="mt-7 max-w-xl text-body-lg text-muted">
            {copy.supporting}
          </p>
          <div data-m="reveal" className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <CtaButton href={copy.primaryCta.href} size="lg">
              {copy.primaryCta.label}
            </CtaButton>
          </div>
          <div data-m="reveal" className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {printSahajSite.contact.emailPublic && printSahajSite.contact.email ? (
              <a href={`mailto:${printSahajSite.contact.email}`} className="founder-linkedin">
                {printSahajSite.contact.email}
              </a>
            ) : null}
            {printSahajSite.contact.whatsappPublic && printSahajSite.contact.whatsappNumber ? (
              <a
                href={`https://wa.me/${printSahajSite.contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="founder-linkedin"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
