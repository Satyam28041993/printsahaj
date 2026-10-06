"use client";

import React, { useEffect, useRef, useState } from "react";
import { solutions, type SolutionFragmentKind } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

/**
 * The workday. Sentences stay in the page. Abstract slips pile onto a desk
 * as each sentence crosses the viewport. Scroll stays native — nothing pins
 * the page or captures the wheel. Slips are decorative; the words are not.
 */
export default function SolutionsProblem() {
  const { problem } = solutions;
  const revealRef = useReveal<HTMLElement>();
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let next = -1;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          next = Math.max(next, Number((entry.target as HTMLElement).dataset.index));
        }
        if (next < 0) return;
        setSeen((current) => Math.max(current, next + 1));
      },
      { threshold: 0.55, rootMargin: "0px 0px -18% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={revealRef}
      aria-labelledby="solutions-problem-heading"
      className="sol-problem band-sunken"
    >
      <div className="sol-problem__inner">
        <h2 id="solutions-problem-heading" data-reveal className="sol-problem__title font-display text-display-lg font-bold text-primary text-balance">
          {problem.lines.map((line) => (
            <span key={line} className="sol-problem__title-line">
              {line}
            </span>
          ))}
        </h2>

        <div className="sol-problem__story">
          <div className="sol-desk-wrap">
            <div className="sol-desk feature-card feature-card--teal" aria-hidden="true">
              <p className="sol-desk__kicker">Workday</p>
              {problem.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`sol-slip${index < seen ? " is-in" : ""}`}
                  data-kind={item.kind}
                >
                  <Slip kind={item.kind} />
                </div>
              ))}
            </div>
          </div>

          <ol className="sol-problem__list">
            {problem.items.map((item, index) => (
              <li
                key={item.id}
                data-index={index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="sol-problem__item"
              >
                <span className="sol-problem__index">{String(index + 1).padStart(2, "0")}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="sol-problem__close" data-reveal>
          {problem.bridge.map((line) => (
            <p key={line} className="sol-problem__bridge">
              {line}
            </p>
          ))}
          <p className="sol-problem__sum">{problem.sum}</p>
          <p className="sol-problem__next">{problem.next}</p>
        </div>
      </div>
    </section>
  );
}

function Slip({ kind }: { kind: SolutionFragmentKind }) {
  if (kind === "sheet") {
    return (
      <div className="sol-slip__card">
        <span className="sol-slip__kicker">Sheet</span>
        <span className="sol-cells">
          {Array.from({ length: 12 }, (_, index) => (
            <i key={index} data-fill={index % 4 === 0 ? "on" : undefined} />
          ))}
        </span>
      </div>
    );
  }
  if (kind === "messages") {
    return (
      <div className="sol-slip__card">
        <span className="sol-slip__kicker">Messages</span>
        <span className="sol-bubbles">
          <i data-side="in" />
          <i data-side="out" />
          <i data-side="in" />
        </span>
      </div>
    );
  }
  if (kind === "sum") {
    return (
      <div className="sol-slip__card">
        <span className="sol-slip__kicker">Sum</span>
        <span className="sol-sums">
          <i />
          <i />
          <i data-total="true" />
        </span>
      </div>
    );
  }
  if (kind === "report") {
    return (
      <div className="sol-slip__card">
        <span className="sol-slip__kicker">Report</span>
        <span className="sol-lines">
          <i data-title="true" />
          <i />
          <i />
          <i />
        </span>
      </div>
    );
  }
  if (kind === "reminder") {
    return (
      <div className="sol-slip__card sol-slip__card--row">
        <span className="sol-bell" />
        <span>
          <span className="sol-slip__kicker">Reminder</span>
          <span className="sol-slip__when">Later today</span>
        </span>
      </div>
    );
  }
  return (
    <div className="sol-slip__card">
      <span className="sol-slip__kicker">Task</span>
      <span className="sol-tasks">
        <i data-done="true" />
        <i />
      </span>
    </div>
  );
}
