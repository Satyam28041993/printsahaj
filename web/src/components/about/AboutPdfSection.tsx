"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import { about } from "@content/about";
import AboutSection from "./AboutSection";
import DownloadPdfButton from "./DownloadPdfButton";

export default function AboutPdfSection() {
  const copy = about.pdf;
  const revealRef = useReveal<HTMLDivElement>({ start: "top 88%" });

  return (
    <AboutSection labelledBy="about-pdf-heading">
      <div ref={revealRef} className="max-w-[36rem]">
        <h2 data-reveal id="about-pdf-heading" className="font-display text-display-md font-bold text-primary">
          {copy.heading}
        </h2>
        <p data-reveal className="mt-4 text-base leading-relaxed text-muted">
          {copy.supporting}
        </p>
        <div data-reveal className="mt-10">
          <DownloadPdfButton />
        </div>
      </div>
    </AboutSection>
  );
}
