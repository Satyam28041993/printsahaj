import React from "react";
import { home, type HomeFaqContent } from "@content/home";
import { faq as printverifyFaq } from "@content/faq";

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
export default function FaqSection({
  content,
}: {
  content?: HomeFaqContent;
}) {
  const copy = content ?? home.faq;

  return (
    <section id="faq" className="relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8" aria-labelledby="faq-heading">
      <div className="mx-auto w-full max-w-4xl">
        <h2 id="faq-heading" className="font-display text-display-lg font-bold text-primary">
          {copy.heading}
        </h2>

        <div className="mt-10 divide-y divide-hairline border-y border-hairline">
          {copy.items.map((item, i) => (
            <details key={item.question} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-title font-semibold text-primary">
                {item.question}
                <Chevron />
              </summary>
              <p className="mt-3 max-w-2xl text-body-lg text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrintVerifyFaqSection() {
  return <FaqSection content={printverifyFaq} />;
}
