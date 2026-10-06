"use client";

import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { solutions } from "@content/solutions";
import { useReveal } from "@/lib/useReveal";

/** Stagger index for the shared reveal. Authored --i is kept by observeReveals. */
function beat(index: number): React.CSSProperties {
  return { "--i": String(index) } as React.CSSProperties;
}

/** A short set of questions before the conversation. One item open at a time. */
export default function SolutionsFaq() {
  const { faq } = solutions;
  const revealRef = useReveal<HTMLElement>();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section ref={revealRef} aria-labelledby="solutions-faq-heading" className="sol-faq">
      <div className="sol-faq__inner">
        <h2 id="solutions-faq-heading" data-reveal className="sol-faq__title" style={beat(0)}>
          {faq.title}
        </h2>
        <p data-reveal className="sol-faq__support" style={beat(1)}>
          {faq.supporting}
        </p>
        <div className="sol-faq__list">
          {faq.items.map((item) => {
            const open = openId === item.id;
            const buttonId = `${baseId}-${item.id}-button`;
            const panelId = `${baseId}-${item.id}-panel`;
            return (
              <div key={item.id} className="sol-faq__item" data-reveal style={beat(2)}>
                <h3 className="sol-faq__heading">
                  <button
                    id={buttonId}
                    type="button"
                    className="sol-faq__button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown className="sol-faq__chevron" size={18} strokeWidth={1.6} aria-hidden />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={open ? undefined : true}
                  className={open ? "sol-faq__panel is-open" : "sol-faq__panel"}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
