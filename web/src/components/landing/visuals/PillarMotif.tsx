import React from "react";

const ICONS = {
  software: (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <circle cx="14" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="34" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="34" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="34" cy="34" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="3.2" fill="currentColor" />
      <path d="M18 14h12M14 18v12M34 18v12M18 34h12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <circle cx="12" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="36" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="36" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="36" cy="36" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M15 16h8.5M15 32h8.5M23.5 16c4 0 4 8 8.5 8M23.5 32c4 0 4-8 8.5-8M32 12v9M32 27v6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  ),
  growth: (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <path d="M10 12h28L32 20H16L10 12z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 22h16l-4 8H20l-4-8z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 32h8v6h-8z" fill="currentColor" opacity="0.85" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <rect x="8" y="8" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="26" y="8" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8" y="26" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="26" y="26" width="14" height="14" rx="2" fill="currentColor" opacity="0.85" />
    </svg>
  ),
} as const;

export type PillarMotifId = keyof typeof ICONS;

export default function PillarMotif({ id }: { id: PillarMotifId }) {
  return (
    <span className="inline-flex text-accent transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
      {ICONS[id]}
    </span>
  );
}

export const PILLAR_MOTIFS: PillarMotifId[] = ["software", "ai", "growth", "products"];
