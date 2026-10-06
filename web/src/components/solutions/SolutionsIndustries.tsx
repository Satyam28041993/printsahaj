"use client";

import React from "react";
import { ArrowLeftRight, Briefcase, Factory, GraduationCap, Package, Store, Truck, type LucideIcon } from "lucide-react";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

const ENV_ICONS: Record<string, LucideIcon> = {
  manufacturing: Factory,
  trading: ArrowLeftRight,
  services: Briefcase,
  retail: Store,
  education: GraduationCap,
  logistics: Truck,
  printing: Package,
};

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/**
 * Different places work happens, not a list of packages. Printing & Packaging
 * carries a small expertise note. The other labels stay equal.
 */
export default function SolutionsIndustries() {
  const { industries } = solutions;
  const revealRef = useReveal<HTMLElement>();

  return (
    <section ref={revealRef} aria-labelledby="solutions-industries-heading" className="sol-industries">
      <div className="sol-industries__inner">
        <h2 id="solutions-industries-heading" data-reveal className="sol-industries__title" style={beat(0)}>
          {industries.title}
        </h2>
        <div data-reveal className="sol-industries__support" style={beat(1)}>
          {industries.supporting.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <ul className="sol-envs">
          {industries.environments.map((environment, index) => {
            const Icon = ENV_ICONS[environment.id];
            return (
              <li
                key={environment.id}
                data-reveal
                className={
                  "note" in environment ? "sol-env sol-env--deep" : environment.id === "more" ? "sol-env sol-env--more" : "sol-env"
                }
                style={beat(index + 3)}
              >
                {"note" in environment ? <span className="sol-env__note">{environment.note}</span> : null}
                <span className="sol-env__line">
                  {Icon ? <Icon className="sol-env__icon" size={16} strokeWidth={1.6} aria-hidden /> : null}
                  {environment.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
