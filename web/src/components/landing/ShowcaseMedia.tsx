"use client";

import React from "react";
import { SHOWCASE_CAPTIONS, SHOWCASE_MEDIA, SHOWCASE_SIZE, type ShowcaseSlug } from "@/data/showcase";
import { useInViewState, usePrefersReducedMotion } from "@/lib/useHomeMotion";

/**
 * A real screenshot / screen recording in a clean app frame. Shows
 * public/showcase/<slug>.webp|png and/or .mp4 when its flag is set in
 * src/data/showcase.ts, else `fallback` (the animated mock-up), else nothing.
 * The video is muted, looping, inline, only loaded once near the screen, and
 * stays on its poster image for visitors who prefer reduced motion.
 */
export default function ShowcaseMedia({
  slug,
  title,
  fallback = null,
  className = "",
}: {
  slug: ShowcaseSlug;
  title: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const flags = SHOWCASE_MEDIA[slug];
  const image = flags.webp ? `/showcase/${slug}.webp` : flags.png ? `/showcase/${slug}.png` : null;
  const video = flags.mp4 ? `/showcase/${slug}.mp4` : null;
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewState<HTMLElement>("200px");
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (inView) setNear(true);
  }, [inView]);

  if (!image && !video) return <>{fallback}</>;

  return (
    <figure ref={ref} className={`media-figure ${className}`}>
    <div className="dev media-frame">
      <div className="dev__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="dev__title">{title}</span>
      </div>
      <div className="media-frame__screen">
        {video && near && !reduced ? (
          <video
            src={video}
            poster={image ?? undefined}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label={title}
          />
        ) : image ? (
          // Static export ships images unoptimized; next/image is not used on this site.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} width={SHOWCASE_SIZE.width} height={SHOWCASE_SIZE.height} loading="lazy" decoding="async" />
        ) : null}
      </div>
    </div>
    <figcaption className="media-caption">{SHOWCASE_CAPTIONS[slug]}</figcaption>
    </figure>
  );
}
