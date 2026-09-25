"use client";

import React, { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Confirmed CRM concepts only. Sample labels are generic — not a client record. */
export const CRM_STAGES = ["Enquiry", "Quote", "Follow-up"] as const;

const COMPLETED_INDEX = CRM_STAGES.length - 1;

export default function CrmWindow({
  sequence = false,
  labelledBy,
}: {
  /** Play Enquiry → Quote → Follow-up once, then rest on the completed step. */
  sequence?: boolean;
  labelledBy?: string;
}) {
  const [active, setActive] = useState(COMPLETED_INDEX);

  useEffect(() => {
    if (!sequence || prefersReducedMotion()) return;
    let step = 0;
    let tick = 0;
    const start = window.setTimeout(() => {
      setActive(0);
      tick = window.setInterval(() => {
        step += 1;
        setActive(Math.min(step, COMPLETED_INDEX));
        if (step >= COMPLETED_INDEX) window.clearInterval(tick);
      }, 1400);
    }, 400);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
    };
  }, [sequence]);

  const stage = CRM_STAGES[active] ?? CRM_STAGES[COMPLETED_INDEX];

  return (
    <div
      className="crm-window"
      role="img"
      aria-labelledby={labelledBy}
      aria-label={
        labelledBy
          ? undefined
          : "PrintSahaj CRM sample. A sample customer and sample job, with enquiry, quote and follow-up."
      }
    >
      <div className="crm-window__chrome">
        <span className="crm-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <p className="crm-window__title">PrintSahaj CRM</p>
        <p className="crm-window__context">Sample</p>
      </div>

      <div className="crm-window__body">
        <div className="crm-window__side">
          <p className="crm-window__side-label">Customer</p>
          <ol className="crm-window__list">
            {CRM_STAGES.map((name, index) => {
              const selected = index === active;
              return (
                <li key={name} className={selected ? "is-selected" : undefined}>
                  <span className="crm-window__mark" aria-hidden="true" />
                  <span className="crm-window__name">{name}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="crm-window__detail" aria-live="polite">
          <div className="crm-window__record">
            <span className="crm-window__avatar" aria-hidden="true">
              S
            </span>
            <div>
              <p className="crm-window__record-name">Sample customer</p>
              <p className="crm-window__record-meta">Sample job</p>
            </div>
            <span className="crm-window__badge">{stage}</span>
          </div>
          <dl>
            <div>
              <dt>Customer</dt>
              <dd>Sample customer</dd>
            </div>
            <div>
              <dt>Job</dt>
              <dd>Sample job</dd>
            </div>
            <div>
              <dt>Stage</dt>
              <dd>{stage}</dd>
            </div>
          </dl>
        </div>
      </div>

      <ol className="crm-window__rail" aria-hidden="true">
        {CRM_STAGES.map((name, index) => (
          <li key={name} className={index <= active ? "is-on" : undefined}>
            <span>{name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
