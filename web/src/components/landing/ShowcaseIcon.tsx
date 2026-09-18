import React from "react";
import type { ShowcaseIcon as IconName } from "@content/showcase";

const PATHS: Record<IconName, React.ReactNode> = {
  // A plate with a tick: checked before it is made.
  verify: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  // Stacked layers: one system under the work.
  erp: (
    <>
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5L12 21l9-4.5" />
    </>
  ),
  // People and a thread between them.
  crm: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M14 20c0-2.2 1.3-4 3-4s3 1.8 3 4" />
    </>
  ),
  // A rupee sign in a tag.
  rate: (
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <path d="M9.5 8.5h4M9.5 10.5h4M11 8.5c1.5 0 1.5 3 0 3h-1.5l3 3" />
    </>
  ),
  // A gear.
  repeat: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  // A sheet split into ups.
  ups: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16M3 12h18" />
    </>
  ),
};

export default function ShowcaseIcon({ name }: { name: IconName }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
