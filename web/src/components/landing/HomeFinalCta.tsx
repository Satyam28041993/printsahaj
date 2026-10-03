import React from "react";
import Link from "next/link";
import CtaButton from "./CtaButton";
import Pill from "./Pill";
import EnquiryForm from "./EnquiryForm";
import { help } from "@content/help";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/data/contact";
import { home } from "@content/home";

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
            <CtaButton href={WHATSAPP_URL} size="lg">
              {help.consult.primaryCta.label}
            </CtaButton>
            <Pill href={PHONE_TEL} variant="ghost" call ariaLabel={`${help.consult.callCta.label}: ${PHONE_DISPLAY}`}>
              {help.consult.callCta.label}
            </Pill>
          </div>
          <div data-m="reveal" className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a href={`mailto:${EMAIL}`} className="founder-linkedin">
              {EMAIL}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="founder-linkedin">
              WhatsApp
            </a>
            <Link href={copy.primaryCta.href} className="founder-linkedin">
              {copy.primaryCta.label}
            </Link>
          </div>
          <div data-m="reveal" className="mt-10">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
