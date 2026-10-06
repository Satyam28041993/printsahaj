"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, Calculator, FileBarChart, ListChecks, MessageSquare, Table2, type LucideIcon } from "lucide-react";
import { solutions, type SolutionFragmentKind } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

const WORK: Record<SolutionFragmentKind, { label: string; Icon: LucideIcon }> = {
  report: { label: "Report", Icon: FileBarChart },
  sheet: { label: "Data entry", Icon: Table2 },
  messages: { label: "Customer message", Icon: MessageSquare },
  sum: { label: "Calculation", Icon: Calculator },
  reminder: { label: "Reminder", Icon: Bell },
  task: { label: "Task", Icon: ListChecks },
};

/**
 * The workday. On a phone each sentence sits with the card it describes.
 * On a wide screen the same cards stay in one board and the sentence in
 * view is the one that comes forward. Scroll stays native.
 */
export default function SolutionsProblem() {
  const { problem } = solutions;
  const revealRef = useReveal<HTMLElement>();
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const index = Number((visible[0].target as HTMLElement).dataset.index);
        if (Number.isNaN(index)) return;
        setActive(index);
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: "-18% 0px -40% 0px" },
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
            <div className="sol-board" aria-hidden="true">
              {problem.items.map((item, index) => (
                <WorkCard key={item.id} kind={item.kind} active={index === active} />
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
                <div className="sol-problem__visual">
                  <WorkCard kind={item.kind} active />
                </div>
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

function WorkCard({ kind, active }: { kind: SolutionFragmentKind; active: boolean }) {
  const { label, Icon } = WORK[kind];
  return (
    <div className={active ? "sol-work is-active" : "sol-work"} data-kind={kind}>
      <span className="sol-work__icon">
        <Icon size={18} strokeWidth={1.6} aria-hidden />
      </span>
      <span className="sol-work__label">{label}</span>
      <Cue kind={kind} />
    </div>
  );
}

function Cue({ kind }: { kind: SolutionFragmentKind }) {
  if (kind === "sheet") {
    return (
      <span className="sol-cue sol-cue--grid" aria-hidden>
        {Array.from({ length: 8 }, (_, index) => (
          <i key={index} data-on={index === 1 ? "true" : undefined} />
        ))}
      </span>
    );
  }
  if (kind === "messages") {
    return (
      <span className="sol-cue sol-cue--bubbles" aria-hidden>
        <i data-side="in" />
        <i data-side="out" />
      </span>
    );
  }
  if (kind === "sum") {
    return (
      <span className="sol-cue sol-cue--sum" aria-hidden>
        <i />
        <i />
        <i data-total="true" />
      </span>
    );
  }
  if (kind === "report") {
    return (
      <span className="sol-cue sol-cue--bars" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }
  if (kind === "reminder") {
    return (
      <span className="sol-cue sol-cue--time" aria-hidden>
        <i />
      </span>
    );
  }
  return (
    <span className="sol-cue sol-cue--tasks" aria-hidden>
      <i data-done="true" />
      <i />
    </span>
  );
}
