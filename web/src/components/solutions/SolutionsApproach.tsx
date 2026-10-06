"use client";

import React, { useEffect, useRef } from "react";
import Logo from "@/components/Logo";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

const DESKTOP = "(min-width: 960px)";

/**
 * How the work is approached. The four steps stay in the page as ordinary
 * text. A hairline connects them, and a small mark walks that line as each
 * step becomes the one in view. Scroll stays native.
 */
export default function SolutionsApproach() {
  const { approach } = solutions;
  const revealRef = useReveal<HTMLElement>();
  const journeyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLElement | null>>([]);
  const markRefs = useRef<Array<HTMLElement | null>>([]);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const stepRef = useRef(0);

  useEffect(() => {
    const journey = journeyRef.current;
    if (!journey) return;
    const last = approach.steps.length - 1;
    const motion = document.documentElement.classList.contains("js-motion");
    const desktopQuery = window.matchMedia(DESKTOP);

    const place = (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const horizontal = desktopQuery.matches;
      const current = horizontal ? labelRefs.current[index] : markRefs.current[index];
      const first = horizontal ? labelRefs.current[0] : markRefs.current[0];
      const end = horizontal ? labelRefs.current[last] : markRefs.current[last];
      if (!current || !first || !end) return;
      const origin = (horizontal ? track : journey).getBoundingClientRect();
      const center = (node: HTMLElement, axis: "x" | "y") => {
        const box = node.getBoundingClientRect();
        return axis === "x"
          ? box.left + box.width / 2 - origin.left
          : box.top + box.height / 2 - origin.top;
      };
      const axis = horizontal ? "x" : "y";
      track.style.setProperty("--from", `${center(first, axis)}px`);
      track.style.setProperty("--to", `${center(end, axis)}px`);
      track.style.setProperty("--at", `${center(current, axis)}px`);
      journey.dataset.step = String(index);
      journey.classList.add("is-set");
    };

    const onResize = () => place(stepRef.current);
    const resize = new ResizeObserver(onResize);
    resize.observe(journey);
    desktopQuery.addEventListener("change", onResize);

    if (!motion) {
      stepRef.current = last;
      place(last);
      return () => {
        resize.disconnect();
        desktopQuery.removeEventListener("change", onResize);
      };
    }

    place(0);
    const nodes = stepRefs.current.filter(Boolean) as HTMLElement[];
    // The step whose heading sits nearest the reading line leads. A later
    // step can share the viewport without stealing the mark.
    const pick = () => {
      const line = window.innerHeight * 0.4;
      let best = -1;
      let bestDist = Infinity;
      nodes.forEach((node) => {
        const box = node.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) return;
        const dist = Math.abs(box.top + 28 - line);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(node.dataset.index);
        }
      });
      if (best < 0 || best === stepRef.current) return;
      stepRef.current = best;
      place(best);
    };
    const observer = new IntersectionObserver(pick, {
      threshold: [0, 0.2, 0.45, 0.7, 1],
      rootMargin: "0px 0px -10% 0px",
    });
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      resize.disconnect();
      desktopQuery.removeEventListener("change", onResize);
    };
  }, [approach.steps.length]);

  return (
    <section
      ref={revealRef}
      aria-labelledby="solutions-approach-heading"
      className="sol-approach"
    >
      <div className="sol-approach__inner">
        <h2
          id="solutions-approach-heading"
          data-reveal
          className="sol-approach__title font-display text-display-lg font-bold text-primary text-balance"
        >
          {approach.title}
        </h2>
        <p data-reveal className="sol-approach__lede">
          {approach.supporting}
        </p>

        <div className="sol-approach__journey" ref={journeyRef}>
          <div className="sol-approach__rail" aria-hidden="true">
            <div className="sol-approach__track" ref={trackRef}>
              <span className="sol-approach__base" />
              <span className="sol-approach__fill" />
              <span className="sol-approach__node">
                <Logo showWordmark={false} size="sm" instance="approach" />
              </span>
            </div>
            <div className="sol-approach__labels">
              {approach.steps.map((item, index) => (
                <span
                  key={item.id}
                  ref={(node) => {
                    labelRefs.current[index] = node;
                  }}
                  className="sol-approach__label"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          <ol className="sol-approach__steps">
            {approach.steps.map((item, index) => (
              <li
                key={item.id}
                data-index={index}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                data-reveal
                className="sol-approach__step"
              >
                <h3
                  ref={(node) => {
                    markRefs.current[index] = node;
                  }}
                  className="sol-approach__name"
                >
                  <span className="sol-approach__num">{item.number}</span>
                  {item.title}
                </h3>
                <p className="sol-approach__question">{item.question}</p>
                <div className="sol-approach__body">
                  {item.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
