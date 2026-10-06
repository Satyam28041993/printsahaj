"use client";

import React from "react";
import Pill from "@/components/landing/Pill";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/** The page ends as a conversation. Typography, then the two existing actions. */
export default function SolutionsClose() {
  const { close } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-close-heading" className="sol-close band-sunken">
      <div className="sol-close__inner">
        <h2 id="solutions-close-heading" data-reveal className="sol-close__title" style={beat(0)}>
          {close.title}
        </h2>
        <div data-reveal className="sol-close__support" style={beat(1)}>
          {close.supporting.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div data-reveal className="sol-close__actions" style={beat(2)}>
          <Pill href={close.primary.href}>{close.primary.label}</Pill>
          <Pill href={close.secondary.href} variant="ghost">
            {close.secondary.label}
          </Pill>
        </div>
        <p data-reveal className="sol-close__note" style={beat(3)}>
          {close.note.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
