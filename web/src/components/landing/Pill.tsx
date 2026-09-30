import React from "react";
import Link from "next/link";

function Arrow() {
  return (
    <svg
      className="pill__arrow"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 12h15m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PillProps {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "ghost";
  small?: boolean;
  /** Shows the phone glyph instead of the arrow (tel: links). */
  call?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

/** Dark pill (or ghost pill) with an arrow, 150ms eased hover. */
export default function Pill({
  href,
  children,
  variant = "dark",
  small,
  call,
  className = "",
  ariaLabel,
  onClick,
}: PillProps) {
  const cls = `pill pill--${variant} ${small ? "pill--sm" : ""} ${className}`;
  const inner = (
    <>
      {call ? <PhoneGlyph /> : null}
      {children}
      {call ? null : <Arrow />}
    </>
  );
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
      {inner}
    </Link>
  );
}
