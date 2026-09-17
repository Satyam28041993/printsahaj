import React from "react";

export interface SectionProps {
  id?: string;
  /** Labels the section for assistive tech when the visible heading lives inside. */
  labelledBy?: string;
  className?: string;
  /** Narrower measure, used by the quiet "what it does not do" section. */
  width?: "default" | "narrow" | "wide";
  padding?: "default" | "compact";
  children: React.ReactNode;
}

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

const PADDING = {
  default: "py-[clamp(80px,10vw,180px)]",
  compact: "py-[clamp(64px,7vw,120px)]",
} as const;

/**
 * One page section. Vertical rhythm is clamped so the desktop generosity
 * (180px) collapses sensibly on a phone (80px) without a media query per block.
 */
export default function Section({
  id,
  labelledBy,
  className = "",
  width = "default",
  padding = "default",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative px-5 sm:px-8 ${PADDING[padding]} ${className}`}
    >
      <div className={`mx-auto ${WIDTHS[width]}`}>{children}</div>
    </section>
  );
}
