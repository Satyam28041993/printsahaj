import React from "react";
import Link from "next/link";
import Section from "./Section";
import { home } from "@content/home";

export default function SelectedWork() {
  const copy = home.selectedWork;
  const items = copy.items.filter((item) => item.public);

  if (items.length === 0) return null;

  return (
    <Section labelledBy="work-heading" padding="compact">
      <div>
        <h2
          id="work-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg text-muted">{copy.supporting}</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const inner = (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {item.category}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-title font-semibold text-primary">{item.name}</h3>
                  {item.status ? (
                    <span className="shrink-0 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {item.status}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>
                ) : null}
              </>
            );

            return (
              <li key={item.name}>
                {item.url ? (
                  <Link href={item.url} className="surface-card block h-full rounded-2xl p-6 sm:p-8">
                    {inner}
                  </Link>
                ) : (
                  <div className="surface-card h-full rounded-2xl p-6 sm:p-8">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
