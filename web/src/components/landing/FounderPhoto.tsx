import React from "react";

/** Editorial portrait used on the homepage Founder section and /about. */
export default function FounderPhoto({
  photo,
  name,
  className = "",
}: {
  photo: string | null;
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <figure className={`portrait-editorial aspect-[4/5] w-full ${className}`}>
      {photo ? (
        // Static export ships images unoptimized; next/image is not used elsewhere on this site.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} width={800} height={1000} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="font-display text-5xl font-bold text-primary">{initials}</span>
        </div>
      )}
    </figure>
  );
}
