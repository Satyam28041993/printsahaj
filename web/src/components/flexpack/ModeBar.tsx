"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Segmented } from "./ui";
import { useJob } from "./store";

export default function ModeBar() {
  const { job, patch, resetJob } = useJob();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Segmented
        label="Mode"
        value={job.advanced ? "advanced" : "simple"}
        onChange={(value) => patch({ advanced: value === "advanced" })}
        options={[
          { value: "simple", label: "Simple" },
          { value: "advanced", label: "Advanced" },
        ]}
      />
      <button
        type="button"
        onClick={resetJob}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-primary"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset to worked example
      </button>
    </div>
  );
}
