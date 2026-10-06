"use client";

import React from "react";
import {
  HELP_COLLAGES,
  SHOWCASE_CAPTIONS,
  SHOWCASE_COLLAGES,
  SHOWCASE_MEDIA,
  SHOWCASE_SIZE,
  type ShowcaseSlug,
} from "@/data/showcase";
import { useInViewState, usePrefersReducedMotion } from "@/lib/useHomeMotion";
import DeviceCollage from "./DeviceCollage";
import DeviceFrame from "./DeviceFrame";

/**
 * A real screenshot / screen recording in a DeviceFrame (browser mock-up). Shows
 * public/showcase/<slug>.webp|png and/or .mp4 when its flag is set in
 * src/data/showcase.ts, else `fallback` (the animated mock-up), else nothing.
 * The video is muted, looping, inline, only loaded once near the screen, and
 * stays on its poster image for visitors who prefer reduced motion.
 * When `collage` names a set that has a collage for this slug, that layered
 * mock-up (DeviceCollage) is shown instead.
 */
export default function ShowcaseMedia({
  slug,
  title,
  fallback = null,
  className = "",
  collage,
  priority = false,
  flat = false,
}: {
  slug: ShowcaseSlug;
  title: string;
  fallback?: React.ReactNode;
  className?: string;
  /** Which collage set to use: "Systems that work" or "Where we can help you". */
  collage?: "showcase" | "help";
  /** Eager-load the collage's main image (first visible tab only). */
  priority?: boolean;
  /**
   * Show the collage's main HD screen flat, with no crop and no tilt.
   * Used where a layered mock-up makes the interface hard to read.
   */
  flat?: boolean;
}) {
  const spec = collage === "showcase" ? SHOWCASE_COLLAGES[slug] : collage === "help" ? HELP_COLLAGES[slug] : undefined;
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

  const main = spec?.layers[0];
  if (flat && main) {
    return (
      <figure className={`media-figure ${className}`} aria-label={title}>
        <DeviceFrame variant="browser" ratio={main.width / main.height} tilt={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main.src}
            alt={main.alt || title}
            width={main.width}
            height={main.height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </DeviceFrame>
        {SHOWCASE_CAPTIONS[slug] ? <figcaption className="media-caption">{SHOWCASE_CAPTIONS[slug]}</figcaption> : null}
      </figure>
    );
  }

  if (spec) return <DeviceCollage {...spec} label={title} caption={SHOWCASE_CAPTIONS[slug]} priority={priority} />;
  if (!image && !video) return <>{fallback}</>;

  return (
    <figure ref={ref} className={`media-figure ${className}`}>
    <DeviceFrame variant="browser" ratio={SHOWCASE_SIZE.width / SHOWCASE_SIZE.height}>
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
    </DeviceFrame>
    {SHOWCASE_CAPTIONS[slug] ? <figcaption className="media-caption">{SHOWCASE_CAPTIONS[slug]}</figcaption> : null}
    </figure>
  );
}
