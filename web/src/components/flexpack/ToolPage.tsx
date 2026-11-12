import React from "react";

/** Heading block shared by the four tool pages and the rate book. */
export default function ToolPage({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <>
      <header className="mb-8 mt-8 max-w-3xl">
        <h1 className="font-display text-display-md font-bold text-primary">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{lead}</p>
      </header>
      {children}
    </>
  );
}
