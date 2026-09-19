"use client";

import React from "react";
import Logo from "@/components/Logo";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";

export default function AboutVisitingCard() {
  const copy = about.visitingCard;
  const founder = about.founder;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <AboutSection labelledBy="about-vcard-heading" className="about-section--quiet">
      <div ref={revealRef} className="about-vcard-layout">
        <div className="max-w-[36rem]">
          <p data-reveal className="story-kicker">
            {copy.eyebrow}
          </p>
          <h2
            data-reveal
            id="about-vcard-heading"
            className="mt-6 font-display text-display-md font-bold text-primary text-balance"
          >
            {copy.heading}
          </h2>
          <p data-reveal className="mt-4 text-base leading-relaxed text-muted">
            {copy.supporting}
          </p>
          <p data-reveal className="mt-10">
            <a href={copy.href} download={copy.filename} className="about-download-btn">
              {copy.downloadLabel}
            </a>
          </p>
        </div>

        <article data-reveal className="about-vcard" aria-label="Digital visiting card preview">
          <div className="about-vcard__main">
            <Logo size="sm" instance="vcard" />
            <p className="about-vcard__name">{founder.name}</p>
            <p className="about-vcard__role">{founder.role}</p>
            <ul className="about-vcard__details">
              <li>{founder.contact.phone}</li>
              <li>{founder.contact.email}</li>
              <li>{founder.contact.address}</li>
              <li>{founder.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</li>
            </ul>
          </div>
          <div className="about-vcard__qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={copy.qrSrc} alt={copy.qrAlt} width={96} height={96} />
            <span>LinkedIn</span>
          </div>
        </article>
      </div>
    </AboutSection>
  );
}
