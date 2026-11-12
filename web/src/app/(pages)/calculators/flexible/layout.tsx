import React from "react";
import ToolNav from "@/components/flexpack/ToolNav";
import { flexpack } from "@content/flexpack";

export default function FlexibleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{flexpack.kicker}</p>
      <ToolNav />
      {children}
      <p className="mt-12 border-t border-hairline pt-5 text-[11px] leading-relaxed text-faint">{flexpack.disclaimer}</p>
    </div>
  );
}
