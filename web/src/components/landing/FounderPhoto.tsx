import React from "react";

/** The ring-framed photo used on the homepage Founder section and /about. */
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
    <div className={`founder-photo-frame ${className}`}>
      <div className="founder-photo-frame__glow" aria-hidden="true" />
      <div className="founder-photo-frame__ring">
        {photo ? (
          // Plain img: this static export already ships every other picture unoptimized.
          <img className="founder-photo-frame__img" src={photo} alt={name} />
        ) : (
          <div className="founder-photo-frame__img flex items-center justify-center">
            <span className="font-display text-5xl font-bold text-primary">{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}
