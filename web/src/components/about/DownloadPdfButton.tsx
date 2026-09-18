"use client";

import React, { useEffect } from "react";
import { about } from "@content/about";

export default function DownloadPdfButton() {
  const copy = about.pdf;

  useEffect(() => {
    const previous = document.title;
    const onBefore = () => {
      document.title = copy.documentTitle;
    };
    const onAfter = () => {
      document.title = previous;
    };
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
      document.title = previous;
    };
  }, [copy.documentTitle]);

  return (
    <button type="button" className="about-download-btn" onClick={() => window.print()}>
      {copy.buttonLabel}
    </button>
  );
}
