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
}: {
  alt: string;
  label: string;
  src?: string;
}) {
  return (
    <figure className="sol-figure">
      {src ? (
        // Static export ships images unoptimized; next/image is not used on this site.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sol-figure__img" src={src} alt={alt} />
      ) : (
        <div className="sol-figure__hold" role="img" aria-label={label}>
          <span className="sol-figure__mark" aria-hidden="true" />
          <span className="sol-figure__label">{label}</span>
        </div>
      )}
    </figure>
  );
}
