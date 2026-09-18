import React from "react";
import Link from "next/link";
import { crmHero } from "@content/crm";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Shown in the frame until a real recording is set in content/crm.ts. */
function VideoPlaceholder() {
  return (
    <div className="crm-placeholder" role="img" aria-label="Video coming soon">
      <span className="crm-play" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
        </svg>
      </span>
      <p className="mt-5 font-display text-lg font-semibold text-primary">
        CRM walkthrough
      </p>
      <p className="mt-1 text-sm text-muted">The demo video will play here.</p>
    </div>
  );
}

export default function CrmHero() {
  const { videoSrc, posterSrc } = crmHero;

  return (
    <section className="crm-stage" aria-labelledby="crm-heading">
      <div className="crm-stars" aria-hidden="true" />
      <div className="crm-stars crm-stars--far" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="crm-eyebrow">{crmHero.eyebrow}</p>
          <h1
            id="crm-heading"
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-6xl"
          >
            {crmHero.heading}
            <br />
            <span className="crm-heading-accent">{crmHero.headingAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
            {crmHero.standfirst}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={crmHero.primaryCta.href} className="crm-ring-btn">
              <span className="crm-ring-btn__label">
                {crmHero.primaryCta.label}
                <ArrowIcon />
              </span>
            </Link>
            <Link href={crmHero.secondaryCta.href} className="crm-glass-btn">
              {crmHero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div id="crm-demo" className="crm-frame mt-16 sm:mt-20">
          <div className="crm-frame__inner">
            <div className="crm-frame__bar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            {videoSrc ? (
              <video
                className="crm-video"
                src={videoSrc}
                poster={posterSrc || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={crmHero.videoLabel}
              />
            ) : (
              <VideoPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
