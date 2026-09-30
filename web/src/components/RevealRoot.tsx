"use client";

import React from "react";
import { useReveal } from "@/lib/useReveal";

/** Client wrapper so server components can opt children into scroll reveals via `data-reveal`. */
export default function RevealRoot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
