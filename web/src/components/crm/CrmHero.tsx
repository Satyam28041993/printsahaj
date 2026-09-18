import React from "react";
import { GlassButton, GlowButton } from "@/components/landing/HeroButtons";
import VideoFrame from "@/components/landing/VideoFrame";
import { crmHero } from "@content/crm";

export default function CrmHero() {
  return (
    <section className="hero-stage" aria-labelledby="crm-heading">
      <div className="star-field" aria-hidden="true" />
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="hero-eyebrow">{crmHero.eyebrow}</p>
          <h1
            id="crm-heading"
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-6xl"
          >
            {crmHero.heading}
            <br />
            <span className="hero-accent-text">{crmHero.headingAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
            {crmHero.standfirst}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GlowButton href={crmHero.primaryCta.href}>{crmHero.primaryCta.label}</GlowButton>
            <GlassButton href={crmHero.secondaryCta.href}>
              {crmHero.secondaryCta.label}
            </GlassButton>
          </div>
        </div>

        <VideoFrame
          id="crm-demo"
          className="mt-16 sm:mt-20"
          src={crmHero.videoSrc}
          poster={crmHero.posterSrc}
          label={crmHero.videoLabel}
        />
      </div>
    </section>
  );
}
