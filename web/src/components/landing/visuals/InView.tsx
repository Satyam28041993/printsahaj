"use client";

import React from "react";
import { useActivateOnView } from "@/lib/useActivateOnView";

export default function InView({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, active } = useActivateOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className={`${className} ${active ? "is-visible" : ""}`.trim()}>
      {children}
    </div>
  );
}
