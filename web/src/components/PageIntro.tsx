import React from "react";
import type { PageIntent } from "@content/site";

export default function PageIntro({
  intent,
  title,
  description,
  children,
}: {
  intent: PageIntent | PageIntent[];
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const intents = Array.isArray(intent) ? intent : [intent];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <ul className="flex flex-wrap gap-2">
        {intents.map((item) => (
          <li
            key={item}
            className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
          >
            {item}
          </li>
        ))}
      </ul>
      <h1 className="mt-6 font-display text-display-lg font-bold text-primary">{title}</h1>
      <p className="mt-5 text-body-lg text-muted">{description}</p>
      {children}
    </div>
  );
}
