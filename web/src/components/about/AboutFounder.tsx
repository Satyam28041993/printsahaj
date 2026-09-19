"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutPortrait from "./AboutPortrait";
import AboutSection from "./AboutSection";

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1v3.6c0 .6-.5 1-1 1C10.6 21.2 2.8 13.4 2.8 3.2c0-.6.5-1 1-1H7.4c.6 0 1 .5 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 1 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export default function AboutFounder() {
  const copy = about.founder;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });
  const phoneHref = `tel:${copy.contact.phone.replace(/\s+/g, "")}`;

  return (
    <AboutSection labelledBy="about-founder-heading" className="about-section--founder">
      <div ref={revealRef}>
        <div className="max-w-[40rem]">
          <p data-reveal className="story-kicker">
            {copy.eyebrow}
          </p>
          <h2
            data-reveal
            id="about-founder-heading"
            className="mt-6 font-display text-display-lg font-bold text-primary"
          >
            {copy.name}
          </h2>
          <p data-reveal className="mt-3 text-base text-muted">
            {copy.role}
          </p>
        </div>

        <div className="about-founder-split">
          <div data-reveal className="about-founder-copy">
            <p className="text-body-lg leading-relaxed text-muted">{copy.summary}</p>
            <p className="mt-6 max-w-[40rem] text-base leading-relaxed text-muted">{copy.body}</p>
            <ul className="about-contact">
              <li>
                <a href={phoneHref} className="about-contact__link">
                  <PhoneIcon />
                  {copy.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${copy.contact.email}`} className="about-contact__link">
                  <MailIcon />
                  {copy.contact.email}
                </a>
              </li>
              <li>
                <span className="about-contact__link about-contact__link--static">
                  <PinIcon />
                  {copy.contact.address}
                </span>
              </li>
              <li>
                <a
                  href={copy.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-contact__link"
                >
                  <LinkedInIcon />
                  {copy.linkedinLabel}
                </a>
              </li>
            </ul>
          </div>

          <aside data-reveal className="about-founder-aside">
            <AboutPortrait photo={copy.photo} name={copy.name} size="lg" />
            <blockquote className="about-quote">
              <p>{copy.quote}</p>
              <footer>
                {copy.quoteAttribution}
                <span>{copy.quoteRole}</span>
              </footer>
            </blockquote>
          </aside>
        </div>
      </div>
    </AboutSection>
  );
}
