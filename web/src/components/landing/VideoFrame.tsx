import React from "react";

export interface VideoFrameProps {
  /** Path under web/public. Empty shows a placeholder instead of a blank frame. */
  src: string;
  poster?: string;
  label: string;
  id?: string;
  className?: string;
}

function Placeholder() {
  return (
    <div className="video-placeholder" role="img" aria-label="Video coming soon">
      <span className="video-play" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
        </svg>
      </span>
      <p className="mt-5 font-display text-lg font-semibold text-primary">Product walkthrough</p>
      <p className="mt-1 text-sm text-muted">The demo video will play here.</p>
    </div>
  );
}

/**
 * A framed video with a turning gradient ring, and a cloud of CMYK sparks
 * that spills out past the frame's edges. The video plays muted on a loop,
 * so it starts on its own without asking the visitor for anything.
 */
export default function VideoFrame({ src, poster, label, id, className = "" }: VideoFrameProps) {
  return (
    <div id={id} className={`video-stage ${className}`}>
      <div className="spark-glow" aria-hidden="true" />
      <div className="spark-dust" aria-hidden="true" />
      <div className="spark-dust spark-dust--fine" aria-hidden="true" />

      <div className="video-frame">
        <div className="video-frame__inner">
          <div className="video-frame__bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {src ? (
            <video
              className="video-frame__video"
              src={src}
              poster={poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={label}
            />
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    </div>
  );
}
