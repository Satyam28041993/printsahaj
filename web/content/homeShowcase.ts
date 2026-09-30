/**
 * Homepage showcase: the auto-cycling tabs under the hero.
 *
 * Every visual behind these tabs is sample data written for the page. No client
 * name, logo, customer, phone number, email, rate, PO or job number is shown.
 * Promises are lifted from copy that already exists in content/ — do not add a
 * claim, metric or module here that the product pages do not carry.
 */

import type { ProjectStatus } from "./site";

export type ShowcaseVisualId = "flexora" | "crm" | "websites" | "printverify" | "aivy" | "calculator";

export interface ShowcaseTab {
  id: ShowcaseVisualId;
  label: string;
  status: ProjectStatus;
  promise: string;
  chips: string[];
  cta: { label: string; href: string };
}

export interface ShowcaseContent {
  eyebrow: string;
  heading: string;
  supporting: string;
  sampleNote: string;
  tablistLabel: string;
  pauseLabel: string;
  playLabel: string;
  statusLabel: string;
  tabs: ShowcaseTab[];
  calculator: {
    title: string;
    resultLabel: string;
    fields: { key: "labelW" | "labelH" | "gapAround" | "gapAcross" | "paperRate"; label: string; unit: string }[];
    note: string;
  };
}

export const homeShowcase: ShowcaseContent = {
  eyebrow: "What we've built",
  heading: "Systems that work. Try one right here.",
  supporting: "Products and tools from one team. The last tab is a real calculator, not a picture.",
  sampleNote: "Sample data on screen. Client data is never shown.",
  tablistLabel: "PrintSahaj products and tools",
  pauseLabel: "Pause auto-play",
  playLabel: "Play auto-play",
  statusLabel: "Status",
  tabs: [
    {
      id: "flexora",
      label: "Flexora ERP",
      // CONTENT GAP — NEEDS VERIFICATION: set to "Live" on the owner's instruction for
      // this task, but content/home.ts and /products/flexora still say "Building".
      status: "Live",
      promise: "ERP + HRMS shaped around how flexographic label printers actually run.",
      chips: ["ERP", "HRMS", "Flexographic workflows"],
      cta: { label: "See Flexora", href: "/products/flexora/" },
    },
    {
      id: "crm",
      label: "CRM Suite",
      status: "Live",
      promise: "Every enquiry, quote and follow-up for a customer, in one window.",
      chips: ["Enquiries", "Quotes", "Follow-ups"],
      cta: { label: "See the CRM", href: "/crm/" },
    },
    {
      id: "websites",
      label: "Websites",
      status: "Live",
      promise: "Not just a website. One that brings you business — every page leads to an enquiry.",
      chips: ["Built around your customer", "Fast", "Easy to update"],
      cta: { label: "Start a Project", href: "/contact/" },
    },
    {
      id: "printverify",
      label: "PrintVerify",
      status: "Building",
      promise: "Checks the artwork, approval sheet and plate files against each other before a plate is made.",
      chips: ["Artwork", "Approval sheet", "Plate files"],
      cta: { label: "See PrintVerify", href: "/products/printverify/" },
    },
    {
      id: "aivy",
      label: "Aivy",
      status: "Live",
      promise: "A personal AI assistant: reminders, a morning brief, and tasks made from one sentence.",
      chips: ["Reminders", "Morning brief", "Tasks from a sentence"],
      cta: { label: "All products", href: "/products/" },
    },
    {
      id: "calculator",
      label: "Live Calculator",
      status: "Live",
      promise: "Label Rate & Matrix Costing. Change a number and the rate moves — same formula as the full calculator.",
      chips: ["Real formula", "Runs in your browser", "Roll labels"],
      cta: { label: "Open the full calculator", href: "/calculators/?tab=label-rate" },
    },
  ],
  calculator: {
    title: "Label Rate",
    resultLabel: "Per 1,000 labels",
    fields: [
      { key: "labelW", label: "Width", unit: "mm" },
      { key: "labelH", label: "Height", unit: "mm" },
      { key: "gapAround", label: "Gap around", unit: "mm" },
      { key: "gapAcross", label: "Gap across", unit: "mm" },
      { key: "paperRate", label: "Paper rate", unit: "₹/sqm" },
    ],
    note: "Ink ₹35 / 1,000 · varnish ₹15 / 1,000 · wastage 12% — the calculator defaults.",
  },
};
