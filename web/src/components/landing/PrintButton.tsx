"use client";

import React from "react";

/** Triggers the browser's print dialog — "Save as PDF" makes this page a resume. */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="resume-print-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      Save as PDF
    </button>
  );
}
