"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./Section";
import { useReveal } from "@/lib/useReveal";
import { faq } from "@content/faq";

/**
 * Accordion with an animated height. Built from buttons and regions rather than
 * <details> so the height transition and the ARIA state stay under our control.
 */
export default function Faq() {
  const ref = useReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" labelledBy="faq-heading" width="narrow">
      <div ref={ref}>
        <h2
          data-reveal
          id="faq-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {faq.heading}
        </h2>

        <div className="mt-[clamp(40px,5vw,64px)] border-t border-hairline">
          {faq.items.map((item, i) => {
            const open = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;

            return (
              <div key={item.question} data-reveal className="border-b border-hairline">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-primary"
                  >
                    <span className="font-display text-title font-medium text-primary">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 shrink-0 text-muted transition-transform duration-300 ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path
                          d="M8 3v10M3 8h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-8 text-muted">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
