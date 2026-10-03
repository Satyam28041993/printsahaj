import React from "react";

/**
 * Pure CSS device chrome around a screenshot. The inner screen has a fixed
 * aspect-ratio, so nothing shifts while images load. The faux URL is generic
 * on purpose: never put a real client address here.
 */
export default function DeviceFrame({
  variant = "browser",
  aspect,
  url = "app.printsahaj",
  crop = false,
  className = "",
  children,
}: {
  variant?: "browser" | "laptop" | "phone";
  /** Width / height of the screen, e.g. 1200 / 750. */
  aspect: number;
  url?: string;
  /** Zoom slightly so a light backdrop baked into the image does not read as a second frame. */
  crop?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`df df--${variant} ${className}`}>
      <div className="df__tilt">
        {variant === "browser" ? (
          <div className="df__chrome" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="df__url">{url}</span>
          </div>
        ) : null}
        {variant === "phone" ? <span className="df__notch" aria-hidden="true" /> : null}
        <div className={`df__screen${crop ? " df__screen--crop" : ""}`} style={{ aspectRatio: aspect }}>
          {children}
        </div>
        {variant === "laptop" ? <span className="df__base" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
