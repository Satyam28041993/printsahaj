/**
 * Homepage showcase: the auto-cycling tabs under the hero.
 *
 * Every visual behind these tabs is demo data written for the page. No client
 * name, logo, customer, phone number, email or rate is shown; the order, job and
 * dispatch numbers are generic demo values.
 * Promises are lifted from copy that already exists in content/ — do not add a
 * claim, metric or module here that the product pages do not carry.
 */

import type { ProjectStatus } from "./site";

export type ShowcaseVisualId = "flexora" | "crm" | "websites" | "printverify" | "aivy" | "calculator";

export interface ShowcaseTab {
  id: ShowcaseVisualId;
  label: string;
  status: ProjectStatus;
  /** Shown instead of `status` when set (the chip keeps the status colour). */
  statusText?: string;
  promise: string;
  chips: string[];
  cta: { label: string; href: string };
  /** Replaces the shared demo-data line when this tab shows something else. */
  note?: string;
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
  /** Every visible string inside the mock-up devices. Sample data only. */
  miniUi: {
    flexora: {
      title: string;
      badges: [string, string];
      columns: { name: string; cards: [string, string][] }[];
      hrmsLabel: string;
    };
    crm: {
      title: string;
      listLabel: string;
      rows: [string, string, "info" | "warn" | "ok"][];
      detailName: string;
      steps: string[];
    };
    websites: {
      title: string;
      cta: string;
      formLabel: string;
      formCta: string;
    };
    printverify: {
      title: string;
      files: string[];
      findingsLabel: string;
      tones: { ok: string; warn: string; bad: string };
    };
    aivy: {
      label: string;
      me1: string;
      bot1: string;
      me2: string;
      briefLabel: string;
      tasks: string;
      reminder: string;
    };
  };
  calculator: {
    title: string;
    resultLabel: string;
    /** Shown with "—" when width, height or paper rate is empty or not above zero. */
    invalidHint: string;
    fields: { key: "labelW" | "labelH" | "gapAround" | "gapAcross" | "paperRate"; label: string; unit: string }[];
    note: string;
  };
}

export const homeShowcase: ShowcaseContent = {
  eyebrow: "What we've built",
  heading: "Systems that work. Try one right here.",
  supporting: "Products and tools from one team. The last tab is a real calculator, not a picture.",
  sampleNote: "Demo data shown. Client data is never displayed.",
  tablistLabel: "PrintSahaj products and tools",
  pauseLabel: "Pause auto-play",
  playLabel: "Play auto-play",
  statusLabel: "Status",
  tabs: [
    {
      id: "flexora",
      label: "Flexora ERP",
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
      note: "Client websites · pgpltechprint · ashokraj · tricil. Logos, phones and emails on those pages are not shown.",
    },
    {
      id: "printverify",
      label: "PrintVerify",
      status: "Building",
      statusText: "Pilot · Demo on request",
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
      cta: { label: "AI & Automation", href: "/solutions/" },
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
  miniUi: {
    flexora: {
      title: "Demo data · ERP",
      badges: ["ERP", "HRMS"],
      columns: [
        { name: "Order", cards: [["SO-2417 · 5,000 labels", "40%"], ["SO-2421 · 12,000 labels", "15%"]] },
        { name: "Job", cards: [["JOB-1182 · 6C + Varnish", "70%"], ["JOB-1179 · 4 COL", "55%"]] },
        { name: "Dispatch", cards: [["DSP-0931 · 12 cartons", "100%"], ["DSP-0928 · 8 cartons", "95%"]] },
      ],
      hrmsLabel: "HRMS · Attendance 42/45 · Shift A",
    },
    crm: {
      title: "Demo data · CRM",
      listLabel: "Enquiries",
      rows: [
        ["ENQ-2041 · Carton labels", "Enquiry", "info"],
        ["ENQ-2038 · Roll labels", "Quote sent", "warn"],
        ["ENQ-2029 · Sleeves", "Follow-up", "ok"],
      ],
      detailName: "ENQ-2038 · Roll labels",
      steps: ["Enquiry received", "Quote prepared", "Follow-up scheduled"],
    },
    websites: {
      title: "Demo website",
      cta: "Get a quote",
      formLabel: "Enquiry",
      formCta: "Send enquiry",
    },
    printverify: {
      title: "Demo check",
      files: ["Artwork", "Approval sheet", "Plate files"],
      findingsLabel: "Findings",
      tones: { ok: "Clear", warn: "Look", bad: "Differs" },
    },
    aivy: {
      label: "Aivy · demo",
      me1: "Remind me to call the supplier tomorrow at 10.",
      bot1: "Done. Reminder set for tomorrow, 10:00.",
      me2: "What's on today?",
      briefLabel: "Morning brief",
      tasks: "3 tasks",
      reminder: "1 reminder",
    },
  },
  calculator: {
    title: "Label Rate",
    invalidHint: "Enter a width, height and paper rate above zero.",
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
