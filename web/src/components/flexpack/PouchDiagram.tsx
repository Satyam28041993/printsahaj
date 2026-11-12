import React from "react";
import type { PouchType } from "@/lib/flexpack";

/** Small line diagram for the pouch-type picker. Decorative: the button carries the name. */
export default function PouchDiagram({ type }: { type: PouchType }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.4, fill: "none" } as const;
  const seal = { stroke: "currentColor", strokeWidth: 1, strokeDasharray: "2 2", fill: "none", opacity: 0.6 } as const;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      {type === "three-side-seal" && (
        <>
          <rect x="14" y="8" width="36" height="48" rx="2" {...stroke} />
          <path d="M18 8v44h28V8" {...seal} />
        </>
      )}
      {type === "center-seal" && (
        <>
          <rect x="12" y="10" width="40" height="44" rx="2" {...stroke} />
          <path d="M12 15h40M12 49h40" {...seal} />
          <path d="M32 15v34" {...stroke} />
        </>
      )}
      {type === "stand-up" && (
        <>
          <path d="M16 8h32l4 44c0 3-9 5-20 5s-20-2-20-5z" {...stroke} />
          <path d="M12.5 50c5 3 12 4 19.5 4s14.5-1 19.5-4" {...seal} />
          <path d="M18 15h28" {...stroke} strokeWidth={2.2} />
        </>
      )}
    </svg>
  );
}
