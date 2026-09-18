import React from "react";
import Link from "next/link";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Primary pill with a gradient ring that keeps turning. */
export function RingButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="ring-btn">
      <span className="ring-btn__label">
        {children}
        <ArrowIcon />
      </span>
    </Link>
  );
}

/** Secondary frosted-glass pill. */
export function GlassButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="glass-btn">
      {children}
    </Link>
  );
}
