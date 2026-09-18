"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";
import type { FounderTimelineItem } from "@content/home";

const NODE_INKS = ["var(--cyan)", "var(--violet)", "var(--magenta)", "var(--yellow)", "var(--accent)"];

/**
 * A vertical timeline: a gradient rail with a coloured node per item,
 * revealed on scroll. Shared by the homepage Founder section and /about so
 * a career update only has to change content/home.ts once.
 */
export default function CareerTimeline({
  items,
  heading,
  className = "",
}: {
  items: FounderTimelineItem[];
  heading?: string;
  className?: string;
}) {
  const timelineRef = useReveal<HTMLDivElement>({ start: "top 90%", stagger: 0.1 });

  return (
    <div ref={timelineRef} className={className}>
      {heading && (
        <h3 data-reveal className="font-display text-display-sm font-bold text-primary">
          {heading}
        </h3>
      )}

      <div className={`timeline max-w-2xl ${heading ? "mt-10" : ""}`}>
        <div className="timeline__rail" aria-hidden="true" />
        {items.map((item, i) => (
          <div
            key={`${item.period}-${item.role}`}
            data-reveal
            className={`timeline-item${item.current ? " timeline-item--current" : ""}`}
          >
            <span
              className="timeline-item__node"
              style={{ color: NODE_INKS[i % NODE_INKS.length] }}
              aria-hidden="true"
            />
            <div className="timeline-item__card">
              <p className="timeline-item__period">{item.period}</p>
              <h4 className="mt-1.5 font-display text-lg font-bold text-primary">
                {item.role}
                {item.current && <span className="timeline-item__now">Now</span>}
              </h4>
              <p className="text-sm font-medium text-muted">{item.org}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
