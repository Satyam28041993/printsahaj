import React from "react";

/** Circular executive portrait used only on /about. Homepage keeps its own crop. */
export default function AboutPortrait({
  photo,
  name,
  size = "lg",
}: {
  photo: string | null;
  name: string;
  size?: "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");
  const dim = size === "lg" ? 320 : 220;

  return (
    <figure className={`about-portrait about-portrait--${size}`}>
      {photo ? (
        // Static export ships images unoptimized; next/image is not used elsewhere on this site.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} width={dim} height={dim} />
      ) : (
        <span className="about-portrait__fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </figure>
  );
}
