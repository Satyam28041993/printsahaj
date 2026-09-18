"use client";

import React from "react";
import Link from "next/link";
import FounderPhoto from "./FounderPhoto";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export default function Founder() {
  const copy = home.founder;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 85%" });

  return (
    <section aria-labelledby="founder-heading" className="dots-section">
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
        <div
          ref={revealRef}
          className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)]"
        >
          <div data-reveal>
            <FounderPhoto photo={copy.photo} name={copy.name} />
          </div>
          <div data-reveal>
            <p className="hero-eyebrow">Founder</p>
            <h2 id="founder-heading" className="mt-5 font-display text-display-lg font-bold text-primary">
              {copy.heading}
            </h2>
            <p className="mt-8 font-display text-display-md font-semibold text-primary">{copy.name}</p>
            <p className="mt-2 text-sm text-muted">{copy.role}</p>
            <p className="mt-6 max-w-xl text-body-lg text-muted">{copy.description}</p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {copy.focus.map((item) => (
                <li key={item} className="glow-card__tag">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={copy.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="founder-linkedin"
              >
                <LinkedInIcon />
                Connect on LinkedIn
              </a>
              <Link href="/about" className="founder-linkedin">
                Full profile & resume →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
