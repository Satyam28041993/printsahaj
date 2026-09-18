import React from "react";
import { faq } from "@content/faq";

function Chevron() {
  return (
    <svg
      className="faq-chevron"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Built on <details>, so it opens and closes with no JavaScript, works from
 * the keyboard, and screen readers announce the open state on their own.
 */
export default function FaqSection() {
  return (
    <section id="faq" className="dots-section" aria-labelledby="faq-heading">
      <div className="star-field" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-4xl px-5 py-24 sm:px-8">
        <h2 id="faq-heading" className="section-title text-center text-4xl sm:text-5xl">
          {faq.heading}
        </h2>

        <div className="mt-12 space-y-4">
          {faq.items.map((item, i) => (
            <details key={item.question} className="faq-item" open={i === 0}>
              <summary>
                {item.question}
                <Chevron />
              </summary>
              <p className="faq-item__body">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
