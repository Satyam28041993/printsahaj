"use client";

import React from "react";
import { useInViewState } from "@/lib/useHomeMotion";

/**
 * Edge-faded marquee of chips. The CSS loop runs until GSAP arrives, then the
 * engine takes over and ties its speed and direction to the scroll. The list is drawn twice so the loop is seamless;
 * the copy is hidden from assistive tech. It pauses while off-screen.
 */
export default function Marquee({ items, label }: { items: string[]; label: string }) {
  const { ref, inView } = useInViewState<HTMLDivElement>();
  const group = (
    <div className="h-marquee__group">
      {items.map((item) => (
        <span key={item} className="h-marquee__item">
          {item}
        </span>
      ))}
    </div>
  );
  return (
    <div ref={ref} className="h-marquee" data-m="marquee" data-inview={inView} role="group" aria-label={label}>
      <div className="h-marquee__track">
        {group}
        <div aria-hidden="true" className="contents">
          {group}
        </div>
      </div>
    </div>
  );
}
