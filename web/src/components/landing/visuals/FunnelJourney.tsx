"use client";

import React, { useEffect, useRef, useState } from "react";

export default function FunnelJourney({ stages }: { stages: string[] }) {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.index));
        if (visible.length === 0) return;
        setActive(Math.max(...visible));
      },
      { threshold: 0.6, rootMargin: "0px 0px -15% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stages]);

  const progress = stages.length > 1 ? active / (stages.length - 1) : 0;

  return (
    <ol className="relative">
      <span
        aria-hidden="true"
        className="absolute left-[17px] top-4 bottom-4 w-px bg-hairline"
      />
      <span
        aria-hidden="true"
        className="absolute left-[17px] top-4 w-px origin-top bg-accent transition-[height] duration-500 ease-out"
        style={{ height: `calc(${progress} * (100% - 2rem))` }}
      />
      {stages.map((stage, index) => {
        const isActive = index <= active;
        return (
          <li
            key={stage}
            data-index={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className={`funnel-node relative mb-3 flex items-center gap-4 rounded-2xl border border-hairline bg-elevated/60 px-3 py-3 last:mb-0 ${
              isActive ? "is-active" : ""
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                isActive
                  ? "border-accent-line bg-accent-weak text-accent"
                  : "border-hairline text-faint"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-title font-medium">{stage}</span>
          </li>
        );
      })}
    </ol>
  );
}
