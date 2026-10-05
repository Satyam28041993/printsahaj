"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useInViewState, usePrefersReducedMotion } from "@/lib/useHomeMotion";

/** Dummy plant trail. Same facts as the Flexora flow screen — sample data only. */
const STAGES = [
  { n: "01", name: "In", title: "Job received", big: "New", sub: "Demo Foods · email today" },
  { n: "02", name: "Job", title: "Job entry", big: "JOB-1182", sub: "60×90 mm · 6C + W + V" },
  { n: "03", name: "PO", title: "PO created", big: "50,000", sub: "labels · PO-4471" },
  { n: "04", name: "Plate", title: "Plate entry", big: "6 plates", sub: "Booked and coded" },
  { n: "05", name: "Die", title: "Die entry", big: "D-207", sub: "60×90 mm · cylinder OK" },
  { n: "06", name: "Press", title: "Production", big: "68%", sub: "Press 2 · on the run" },
  { n: "07", name: "QC", title: "Quality check", big: "99.2%", sub: "Pass · lot released" },
  { n: "08", name: "Stock", title: "Finished goods", big: "48", sub: "rolls · Bay A-12" },
  { n: "09", name: "Ship", title: "Dispatch", big: "TRUCK-07", sub: "INV-889 · shipped" },
] as const;

const STEP_MS = 1700;

/**
 * Flexora order-to-dispatch as a circle track. One stage is large; a highlight
 * walks the circles. Tall stage cards are not used — they do not stay readable
 * inside the laptop frame.
 */
export default function FlexoraFlow() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewState<HTMLDivElement>("0px");
  const [index, setIndex] = useState(0);
  const stage = STAGES[index];

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setInterval(() => {
      const slide = ref.current?.closest(".cr__slide");
      if (slide?.getAttribute("aria-hidden") === "true") return;
      setIndex((n) => (n + 1) % STAGES.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [reduced, inView, ref]);

  return (
    <div
      ref={ref}
      className="fxf"
      data-reduced={reduced ? "true" : undefined}
      style={{ "--i": index } as CSSProperties}
      role="group"
      aria-label="Flexora demo. A highlight walks nine stages from order to dispatch."
    >
      <header className="fxf__head">
        <div className="fxf__brand">
          <span className="fxf__mark">Fx</span>
          <span>
            <span className="fxf__eyebrow">Flexora</span>
            <span className="fxf__kicker">Order to dispatch</span>
          </span>
        </div>
        <span className="fxf__demo">Demo data</span>
      </header>

      <div className="fxf__track">
        <span className="fxf__rail" />
        <span className="fxf__rail-fill" />
        <span className="fxf__comet" />
        {STAGES.map((item, i) => (
          <button
            key={item.n}
            type="button"
            className={`fxf__step${i === index ? " is-on" : ""}${i < index ? " is-done" : ""}`}
            aria-label={`${item.n} ${item.title}`}
            aria-current={i === index ? "step" : undefined}
            onClick={() => setIndex(i)}
          >
            <span className="fxf__dot">{item.n}</span>
            <span className="fxf__name">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="fxf__card" key={stage.n}>
        <p className="fxf__stage">
          <span>{stage.n}</span>
          {stage.title}
        </p>
        <p className="fxf__big">{stage.big}</p>
        <p className="fxf__sub">{stage.sub}</p>
      </div>
    </div>
  );
}
