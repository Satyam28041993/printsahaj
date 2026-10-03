import React from "react";

/**
 * A premium device mock-up around any screen content. Pure CSS, no images.
 *  - browser: window chrome (three dots + a generic URL pill)
 *  - laptop:  the same window inside a bezel, on a base
 *  - phone:   rounded bezel with a notch (portrait screens)
 *  - tablet:  a thin bezel, no browser bar
 *  - card:    no chrome at all, a rounded screen with a shadow (floating UI fragments)
 * The screen has a fixed aspect-ratio, so its height is known before any image
 * loads (no layout shift). A theme-aware gradient sits behind the device; the
 * slight tilt is applied in CSS only at >= 1024px without reduced motion.
 */
export type DeviceVariant = "browser" | "laptop" | "phone" | "tablet" | "card";

export default function DeviceFrame({
  variant = "browser",
  ratio,
  url = "app.printsahaj",
  tilt = true,
  className = "",
  children,
}: {
  variant?: DeviceVariant;
  /** Screen width / height. */
  ratio: number;
  /** Text in the faux URL pill. Generic only — never a real client address. */
  url?: string;
  tilt?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const chrome =
    variant === "phone" || variant === "tablet" || variant === "card" ? null : (
      <div className="dvf__bar" aria-hidden="true">
        <span className="dvf__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="dvf__url">
          <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
            <path d="M3.5 5V3.75a2.5 2.5 0 0 1 5 0V5M2.75 5h6.5v4.5h-6.5z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {url}
        </span>
      </div>
    );

  return (
    <div className={`dvf dvf--${variant} ${tilt ? "dvf--tilt" : ""} ${className}`}>
      <div className="dvf__rig">
        <div className="dvf__device">
          {variant === "phone" ? <span className="dvf__notch" aria-hidden="true" /> : null}
          <div className="dvf__window">
            {chrome}
            <div className="dvf__screen" style={{ aspectRatio: String(ratio) }}>
              {children}
            </div>
          </div>
        </div>
        {variant === "laptop" ? <div className="dvf__base" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}

/** A rectangle of the source image, in its own pixels: [x, y, width, height]. */
export type CropBox = readonly [number, number, number, number];

/**
 * An image cropped to `crop` (for screenshots with a backdrop baked in around
 * the app) and placed in a screen of aspect `ratio`:
 *  - "fill": the crop covers the screen edge to edge (trims at most a few %)
 *  - "card": the crop is contained, centred, with rounded corners and a shadow
 * The <img> keeps its intrinsic width/height attributes.
 */
export function CroppedImage({
  src,
  alt,
  width,
  height,
  crop,
  ratio,
  fit = "fill",
  radius = 0,
  loading,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  crop?: CropBox;
  ratio: number;
  fit?: "fill" | "card";
  /** Corner radius of the cropped card, in source pixels (card fit only). */
  radius?: number;
  loading?: "lazy" | "eager";
  /** Layout width hint for the browser (there is no srcset: one size per file). */
  sizes?: string;
}) {
  const [cx, cy, cw, ch] = crop ?? [0, 0, width, height];
  const c = cw / ch;
  // Box size as a % of the screen: cover for fill, contain (with room) for card.
  const scale = fit === "card" ? 0.86 : 1;
  const wider = c > ratio;
  const cover = fit === "fill";
  const boxW = (cover ? (wider ? c / ratio : 1) : wider ? 1 : c / ratio) * 100 * scale;
  const boxH = (cover ? (wider ? 1 : ratio / c) : wider ? ratio / c : 1) * 100 * scale;
  const pct = (n: number) => `${+n.toFixed(4)}%`;

  return (
    <span
      className={`dvf-crop dvf-crop--${fit}`}
      style={{
        width: pct(boxW),
        height: pct(boxH),
        borderRadius: fit === "card" && radius ? `${pct((radius / cw) * 100)} / ${pct((radius / ch) * 100)}` : undefined,
      }}
    >
      {/* Static export ships images unoptimized; next/image is not used on this site. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        decoding="async"
        draggable={false}
        style={{
          width: pct((width / cw) * 100),
          height: pct((height / ch) * 100),
          left: pct((-cx / cw) * 100),
          top: pct((-cy / ch) * 100),
        }}
      />
    </span>
  );
}
