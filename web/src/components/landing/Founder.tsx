"use client";

import React from "react";
import Link from "next/link";
import { useInViewState } from "@/lib/useHomeMotion";
import { home } from "@content/home";

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/** Homepage founder panel: framed portrait with a slow gradient border, credentials, quote. */
export default function Founder() {
  const copy = home.founder;
  const { ref: frameRef, inView } = useInViewState<HTMLElement>();

  return (
    <section aria-labelledby="founder-heading" className="h-wrap py-[clamp(24px,4vw,56px)]">
      <div className="fd">
        <div className="fd__grid">
          <div className="fd__stage">
            <figure ref={frameRef} className="fd__frame" data-m="reveal" data-m-y="0" data-m-scale="0.9" data-m-rotate="-2" data-m-dur="0.8" data-m-no-blur data-inview={inView}>
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
                    data-m="parallax"
                    data-m-speed="7"
                    data-m-zoom="1.14"
                  />
                ) : null}
              </div>
              <figcaption className="fd__badge" data-m="pop" data-m-scale="0.5" data-m-ease="back.out(2)">
                <i aria-hidden="true" />
                {copy.badge}
              </figcaption>
            </figure>
          </div>

          <div>
            <div data-m="reveal">
              <p className="h-kicker" data-m-child>
                {copy.eyebrow}
              </p>
            </div>
            <h2
              id="founder-heading"
              className="h-title h-title--lg mt-4 max-w-[20ch]"
              data-m="lines"
            >
              {copy.heading}
            </h2>
            <div data-m="reveal">
              <p className="fd__name" data-m-child>
                {copy.name}
              </p>
              <p className="fd__role" data-m-child>
                {copy.role}
              </p>
              <p className="h-lead mt-5 max-w-[62ch]" data-m-child>
                {copy.description}
              </p>
            </div>

            <ul className="fd__chips" aria-label={copy.chipsLabel} data-m="pop">
              {copy.focus.map((item) => (
                <li key={item} className="fd__chip" data-m-child>
                  {item}
                </li>
              ))}
            </ul>

            <dl className="fd__facts" data-m="reveal">
              {copy.facts.map((fact) => (
                <div
                  key={fact.label}
                  className={`fd__fact m-lift${fact.past ? " fd__fact--past" : ""}`}
                  data-m-child
                  data-m-card
                >
                  <dt className="h-kicker !text-[10px]">{fact.label}</dt>
                  <dd className="mt-1.5">
                    <b>{fact.value}</b>
                    <span>{fact.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <blockquote className="fd__quote" data-m="words">
              {copy.throughline}
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center gap-3" data-m="reveal">
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
