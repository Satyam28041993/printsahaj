"use client";

import React from "react";
import { useSpotlight } from "@/lib/useHomeMotion";

/**
 * A `.h-panel` with the cursor-follow spotlight. Client-only behaviour; the
 * children stay server-rendered.
 */
export default function SpotPanel({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  const spotRef = useSpotlight<HTMLDivElement>();
  return (
    <div ref={spotRef} className={`h-panel ${className}`} {...rest}>
      {children}
    </div>
  );
}
