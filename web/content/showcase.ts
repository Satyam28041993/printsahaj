/**
 * Homepage hub: products above the hub, tools below it, and the PrintVerify
 * results panel. Descriptions come from content/home.ts and content/tools.ts —
 * keep them in step if either changes.
 *
 * The results rows quote messages the engine actually produces. The red row is
 * the real output for the varnish case in content/caseStudies.ts; do not swap
 * in a finding the engine has not produced.
 */

export type ShowcaseIcon = "verify" | "erp" | "crm" | "rate" | "repeat" | "ups";

export interface ShowcaseCard {
  name: string;
  tag: string;
  description: string;
  href: string;
  icon: ShowcaseIcon;
}

export type ResultTone = "ok" | "warn" | "bad";

export interface ResultRow {
  tone: ResultTone;
  label: string;
  message: string;
}

export const showcase = {
  heading: "One partner for the systems your business runs on",
  supporting: "Products for the work itself, tools for the numbers around it.",
  products: [
    {
      name: "PrintVerify",
      tag: "Pre-press checks",
      description:
        "Checks the artwork, approval sheet and plate files against each other before a plate is made.",
      href: "/products/printverify",
      icon: "verify",
    },
    {
      name: "Flexora",
      tag: "ERP + HRMS",
      description: "ERP and HRMS built around how flexographic label printers actually run.",
      href: "/products/flexora",
      icon: "erp",
    },
    {
      name: "CRM",
      tag: "Lead management",
      description: "Enquiries, quotes and follow-ups for a customer, kept in one place.",
      href: "/crm/",
      icon: "crm",
    },
  ] satisfies ShowcaseCard[],
  tools: [
    {
      name: "Label Rate & Matrix Costing",
      tag: "Costing",
      description: "Roll-label cost from size, gaps, paper rate, ink, varnish and wastage.",
      href: "/calculators/?tab=label-rate",
      icon: "rate",
    },
    {
      name: "Flexo Cylinder Repeat",
      tag: "Flexo",
      description: "Teeth to repeat at 1/8 inch circular pitch. Repeat = teeth x 3.175 mm.",
      href: "/calculators/?tab=gear-repeat",
      icon: "repeat",
    },
    {
      name: "Indian Sheet Ups Planner",
      tag: "Layout",
      description: "Mono carton layout for Demy, Crown, Royal and other Indian sheet sizes.",
      href: "/calculators/?tab=sheet-ups",
      icon: "ups",
    },
  ] satisfies ShowcaseCard[],
};

export const results = {
  eyebrow: "PrintVerify",
  heading: "Every finding says how sure it is",
  supporting:
    "Green means nothing wrong was found. Amber means look at it yourself. Red means the files disagree, and the report says exactly where.",
  rows: [
    {
      tone: "ok",
      label: "Wording on artwork vs first approval",
      message: "No wording difference was flagged between the two files.",
    },
    {
      tone: "warn",
      label: "Mandatory text on one plate only",
      message: "If that unit fails, the label loses a required field.",
    },
    {
      tone: "bad",
      label: "Plate count",
      message:
        "Declared 7 units (6 COL + VARNISH), found 6 separation pages. 1 unit missing: Varnish.",
    },
  ] satisfies ResultRow[],
  cta: { label: "See the real jobs", href: "/case-studies/" },
};
