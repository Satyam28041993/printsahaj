"use client";

import React, { useId } from "react";
import { site } from "@content/site";

/**
 * Overlap colours are true subtractive (multiply) products of the three inks,
 * computed from the brand values rather than eyeballed:
 *   #00AEEF x #EC008C = #000083   cyan + magenta
 *   #EC008C x #FFF200 = #EC0000   magenta + yellow
 *   #00AEEF x #FFF200 = #00A400   cyan + yellow
 *   all three         = #000000   the key
 */
const INK = {
  cyan: "#00AEEF",
  magenta: "#EC008C",
  yellow: "#FFF200",
  cyanMagenta: "#000083",
  magentaYellow: "#EC0000",
  cyanYellow: "#00A400",
  core: "#08090B",
} as const;

/**
 * The SVG viewBox is 0 0 100 100. Visible mark is roughly y=9–91 (82 units),
 * so visual height ≈ 0.82 × CSS size. Header uses `md` (56px) → ~46px visual.
 */
const SIZES = {
  sm: 44,
  md: 56,
  lg: 58,
  xl: 72,
} as const;

const TEXT_SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-2xl",
  xl: "text-4xl",
} as const;

export interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: keyof typeof SIZES;
  /** Stable clip-path prefix so two marks on one page never collide. */
  instance?: string;
  /** Marks the SVG decorative when the wordmark already names the brand. */
  titleOverride?: string;
}

/**
 * The PrintSahaj mark: three translucent process-ink circles whose overlaps
 * produce genuine subtractive blends, with a check centred in the key core.
 *
 * Built as inline SVG rather than an image so individual plates can be animated.
 * Every ink circle carries a `data-plate` attribute for that purpose.
 */
export default function Logo({
  className = "",
  showWordmark = true,
  size = "md",
  instance,
  titleOverride,
}: LogoProps) {
  const generatedId = useId().replace(/:/g, "");
  const uid = instance ?? generatedId;
  const px = SIZES[size];
  const clipC = `${uid}-c`;
  const clipM = `${uid}-m`;
  const clipY = `${uid}-y`;
  const title = titleOverride ?? "PrintSahaj";

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        role="img"
        aria-label={showWordmark ? undefined : title}
        aria-hidden={showWordmark || undefined}
        focusable="false"
      >
        <defs>
          <clipPath id={clipC}>
            <circle cx="50" cy="36" r="27" />
          </clipPath>
          <clipPath id={clipM}>
            <circle cx="32" cy="64" r="27" />
          </clipPath>
          <clipPath id={clipY}>
            <circle cx="68" cy="64" r="27" />
          </clipPath>
        </defs>

        {/* Base inks */}
        <circle data-plate="cyan" cx="50" cy="36" r="27" fill={INK.cyan} />
        <circle data-plate="magenta" cx="32" cy="64" r="27" fill={INK.magenta} />
        <circle data-plate="yellow" cx="68" cy="64" r="27" fill={INK.yellow} />

        {/* Two-ink overlaps, clipped to the true intersections */}
        <g clipPath={`url(#${clipC})`}>
          <g clipPath={`url(#${clipM})`}>
            <rect width="100" height="100" fill={INK.cyanMagenta} />
          </g>
          <g clipPath={`url(#${clipY})`}>
            <rect width="100" height="100" fill={INK.cyanYellow} />
          </g>
        </g>
        <g clipPath={`url(#${clipM})`}>
          <g clipPath={`url(#${clipY})`}>
            <rect width="100" height="100" fill={INK.magentaYellow} />
          </g>
        </g>

        {/* Three-ink overlap — the key */}
        <g clipPath={`url(#${clipC})`}>
          <g clipPath={`url(#${clipM})`}>
            <g clipPath={`url(#${clipY})`}>
              <rect width="100" height="100" fill="#000000" />
            </g>
          </g>
        </g>

        {/* The core, seated inside the three-ink zone, and the check */}
        <circle data-plate="core" cx="50" cy="53" r="14" fill={INK.core} />
        <path
          data-plate="check"
          d="M43.5 53.5 L48.2 58.2 L57 48.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-display leading-none tracking-tight text-primary ${TEXT_SIZES[size]}`}
        >
          <span className="font-bold">{site.brand.nameStrong}</span>
          <span className="font-light">{site.brand.nameLight}</span>
        </span>
      )}
    </span>
  );
}
