import React from "react";
import { GlassButton, RingButton } from "./HeroButtons";
import VideoFrame from "./VideoFrame";
import { home } from "@content/home";

export default function HomeHero() {
  const { hero } = home;

  return (
    <section id="top" aria-labelledby="hero-heading" className="hero-stage">
      <div className="star-field" aria-hidden="true" />
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-[clamp(120px,14vw,168px)] sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="hero-eyebrow">{hero.specialization}</p>
          <h1
            id="hero-heading"
            className="mt-6 text-balance font-display text-display-xl font-bold text-primary"
          >
            {hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-muted">{hero.supporting}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <RingButton href={hero.primaryCta.href}>{hero.primaryCta.label}</RingButton>
            <GlassButton href={hero.secondaryCta.href}>{hero.secondaryCta.label}</GlassButton>
          </div>
          <p className="mt-6 text-sm text-faint">{hero.eyebrow}</p>
        </div>

        <VideoFrame
          className="mt-16 sm:mt-20"
          src={hero.video.src}
          poster={hero.video.poster}
          label={hero.video.label}
        />
      </div>
    </section>
  );
}
