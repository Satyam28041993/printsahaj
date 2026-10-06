import React from "react";

/**
 * A framed slot for a solutions photograph. With no `src` it is a quiet
 * placeholder — the label is the accessible name, so the page does not
 * describe a person who is not in the picture yet.
 */
export default function SolutionsFigure({
  alt,
  label,
  src,
  width,
  height,
  priority = false,
  place,
}: {
  alt: string;
  label: string;
  src?: string;
  width?: number;
  height?: number;
  /** Above-the-fold photograph. Below-fold slots stay lazy. */
  priority?: boolean;
  /** Crop hint for the existing frame. Does not change the frame size. */
  place?: "hero" | "ai" | "start";
}) {
  return (
    <figure className={place ? `sol-figure sol-figure--${place}` : "sol-figure"}>
      {src ? (
        // Static export ships images unoptimized; next/image is not used on this site.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="sol-figure__img"
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
        />
      ) : (
        <div className="sol-figure__hold" role="img" aria-label={label}>
          <span className="sol-figure__mark" aria-hidden="true" />
          <span className="sol-figure__label">{label}</span>
        </div>
      )}
    </figure>
  );
}
