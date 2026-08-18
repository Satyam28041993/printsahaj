"use client";

import React, { useLayoutEffect, useRef } from "react";
import Section from "./Section";
import { ensureGsap, REVEAL_EASE } from "@/lib/motion";
import { problem } from "@content/problem";

/**
 * The three documents, revealed in sequence and then drawn toward one another —
 * the convergence is the argument, so it is scrubbed to the scroll rather than
 * fired once.
 */
export default function Problem() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-doc]", {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: REVEAL_EASE,
          stagger: 0.14,
          scrollTrigger: { trigger: "[data-docs]", start: "top 80%", once: true },
        });

        gsap.from("[data-verdict]", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: REVEAL_EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-verdict-block]", start: "top 85%", once: true },
        });
      });

      // Convergence only where the three sit side by side and there is a gutter
      // to close. They meet edge to edge; they never cover one another's text.
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const scrollTrigger = {
          trigger: "[data-docs]",
          start: "top 62%",
          end: "bottom 45%",
          scrub: 0.6,
        } as const;

        gsap.to("[data-doc='0']", { x: 24, scrollTrigger });
        gsap.to("[data-doc='2']", { x: -24, scrollTrigger });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Section id="product" labelledBy="problem-heading">
      <div ref={rootRef}>
        <h2
          id="problem-heading"
          className="max-w-3xl font-display text-display-lg font-bold text-primary"
        >
          {problem.headingLines.map((line, i) => (
            <React.Fragment key={line}>
              <span className={i === 2 ? "text-muted" : undefined}>{line}</span>
              {i < 2 && <br />}
            </React.Fragment>
          ))}
        </h2>

        <div
          data-docs
          className="mt-[clamp(48px,6vw,80px)] grid gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {problem.cards.map((card, i) => (
            <article
              data-doc={i}
              key={card.kicker}
              // The middle card sits on top so the three read as converging on a
              // centre rather than one sliding blindly under another.
              className={`surface-card is-opaque relative rounded-2xl p-6 md:p-7 ${
                i === 1 ? "z-20" : "z-10"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {card.kicker}
              </span>
              <h3 className="mt-3 font-display text-title font-semibold text-primary">
                {card.title}
              </h3>

              <div className="output-panel mt-5 rounded-lg px-4 py-4">
                {card.lines.map((line) => (
                  <p
                    key={line}
                    className="font-mono text-mono text-primary/85 break-words"
                  >
                    {line}
                  </p>
                ))}
              </div>

              <p className="mt-4 text-sm text-faint">{card.caption}</p>
            </article>
          ))}
        </div>

        <div data-verdict-block className="mt-[clamp(48px,6vw,88px)] max-w-3xl">
          <p
            data-verdict
            className="font-display text-display-md font-semibold text-primary"
          >
            {problem.convergenceLine}
          </p>

          <blockquote data-verdict className="mt-10 border-l border-hairline pl-6">
            <p className="text-body-lg italic text-muted">
              &ldquo;{problem.vendorQuote}&rdquo;
            </p>
            <footer className="mt-3 text-sm text-faint">
              {problem.vendorQuoteCaption}
            </footer>
          </blockquote>
        </div>
      </div>
    </Section>
  );
}
