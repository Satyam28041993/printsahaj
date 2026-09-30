"use client";

import React from "react";
import Link from "next/link";
import { useInViewState } from "@/lib/useHomeMotion";
import { useReveal } from "@/lib/useReveal";
import { home } from "@content/home";

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Homepage founder panel: framed portrait with a slow gradient border, credentials, quote. */
export default function Founder() {
  const copy = home.founder;
  const revealRef = useReveal<HTMLDivElement>();
  const { ref: frameRef, inView } = useInViewState<HTMLElement>();

  return (
    <section aria-labelledby="founder-heading" className="h-wrap py-[clamp(24px,4vw,56px)]">
      <div ref={revealRef} className="fd">
        <div className="fd__grid">
          <div className="fd__stage" data-reveal style={idx(0)}>
            <figure ref={frameRef} className="fd__frame" data-inview={inView}>
              <div className="fd__photo">
                {copy.photo ? (
                  // Static export ships images unoptimized; next/image is not used elsewhere on this site.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={copy.photo}
                    alt={copy.photoAlt}
                    width={copy.photoWidth}
                    height={copy.photoHeight}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
              <figcaption className="fd__badge">
                <i aria-hidden="true" />
                {copy.badge}
              </figcaption>
            </figure>
          </div>

          <div>
            <p className="h-kicker" data-reveal style={idx(0)}>
              {copy.eyebrow}
            </p>
            <h2
              id="founder-heading"
              className="h-title h-title--lg mt-4 max-w-[20ch]"
              data-reveal
              style={idx(1)}
            >
              {copy.heading}
            </h2>
            <p className="fd__name" data-reveal style={idx(2)}>
              {copy.name}
            </p>
            <p className="fd__role" data-reveal style={idx(2)}>
              {copy.role}
            </p>
            <p className="h-lead mt-5 max-w-[62ch]" data-reveal style={idx(3)}>
              {copy.description}
            </p>

            <ul className="fd__chips" aria-label={copy.chipsLabel}>
              {copy.focus.map((item, i) => (
                <li key={item} className="fd__chip" data-reveal style={idx(4 + i)}>
                  {item}
                </li>
              ))}
            </ul>

            <dl className="fd__facts">
              {copy.facts.map((fact, i) => (
                <div
                  key={fact.label}
                  className={`fd__fact m-lift${fact.past ? " fd__fact--past" : ""}`}
                  data-reveal
                  style={idx(i)}
                >
                  <dt className="h-kicker !text-[10px]">{fact.label}</dt>
                  <dd className="mt-1.5">
                    <b>{fact.value}</b>
                    <span>{fact.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <blockquote className="fd__quote" data-reveal style={idx(1)}>
              {copy.throughline}
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal style={idx(2)}>
              <a href={copy.linkedin} target="_blank" rel="noopener noreferrer" className="founder-linkedin">
                <LinkedInIcon />
                {copy.linkedinLabel}
              </a>
              <Link href={copy.profileCta.href} className="founder-linkedin">
                {copy.profileCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
