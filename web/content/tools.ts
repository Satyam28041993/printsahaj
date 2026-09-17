/** Tools hub — the website lists tools; each tool lives in its own folder. */

export interface ToolCard {
  name: string;
  href: string;
  summary: string;
  status: string;
  category: string;
  visual: "verify" | "label" | "gsm" | "ups" | "repeat" | "board";
}

export interface ToolsContent {
  heading: string;
  intro: string;
  items: ToolCard[];
}

export const CALCULATOR_TABS = [
  "label-rate",
  "gsm-weight",
  "sheet-ups",
  "gear-repeat",
  "corrugated-bf",
] as const;

export type CalculatorTab = (typeof CALCULATOR_TABS)[number];

export function isCalculatorTab(value: string | null): value is CalculatorTab {
  return CALCULATOR_TABS.includes(value as CalculatorTab);
}

/**
 * Recovered from git history (0237fab) and the live `/calculators` page.
 * Roll length appears in the master plan as an idea only — it was never built.
 */
export const tools: ToolsContent = {
  heading: "Tools built for the work.",
  intro:
    "Practical calculators and utilities for printing, packaging and business workflows.",
  items: [
    {
      name: "PrintVerify",
      href: "/tools/artwork-verification",
      category: "Product tool",
      visual: "verify",
      summary:
        "Compares the job sheet, the approved artwork, and the plate files, and shows where they disagree.",
      status: "Open it online with a sign-in, or run it on your own computer",
    },
    {
      name: "Label Rate & Matrix Costing",
      href: "/calculators/?tab=label-rate",
      category: "Calculator",
      visual: "label",
      summary:
        "Roll-label costing from size, gaps, ₹/sqm paper rate, ink, varnish and wastage.",
      status: "Live",
    },
    {
      name: "GSM to Ream & Sheet Weight",
      href: "/calculators/?tab=gsm-weight",
      category: "Calculator",
      visual: "gsm",
      summary:
        "Indian ream formula: (Length in × Width in × GSM) ÷ 3100 for 500 sheets.",
      status: "Live",
    },
    {
      name: "Indian Sheet Ups Planner",
      href: "/calculators/?tab=sheet-ups",
      category: "Calculator",
      visual: "ups",
      summary:
        "Mono carton layout optimizer for Demy, Crown, Royal and other Indian sheet sizes.",
      status: "Live",
    },
    {
      name: "Flexo Cylinder Repeat",
      href: "/calculators/?tab=gear-repeat",
      category: "Calculator",
      visual: "repeat",
      summary:
        "Teeth to repeat for 1/8 inch circular pitch. Repeat (mm) = Teeth × 3.175.",
      status: "Live",
    },
    {
      name: "Corrugated Bursting Strength",
      href: "/calculators/?tab=corrugated-bf",
      category: "Calculator",
      visual: "board",
      summary:
        "3-ply board bursting strength estimator with 1.45 flute take-up.",
      status: "Live",
    },
  ],
};

export interface ArtworkToolPage {
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  openLabel: string;
  openHref: string;
  openNote: string;
  note: string;
  startHeading: string;
  startSteps: string[];
  backLabel: string;
  backHref: string;
}

export const artworkTool: ArtworkToolPage = {
  name: "PrintVerify",
  kicker: "A tool on PrintSahaj — not the website itself",
  summary:
    "This tool holds the job sheet, the approved artwork, and the plate files together and shows a person where they do not match. It does not say approved or rejected. That decision stays with the person who signs.",
  points: [
    "How many plates the job sheet asked for, versus how many plate pages arrived",
    "Colour names that do not match across the papers",
    "Text that is on the artwork but on no plate — or the other way around",
  ],
  openLabel: "Open PrintVerify",
  openHref: "https://tool.printsahaj.com",
  openNote:
    "Opens the online desk in a new tab. It asks you to sign in, and only cleared addresses get in.",
  note:
    "Computer par chalane ka tarika neeche hai. Chrome ka “This site can’t be reached / refused to connect” isliye aata hai kyunki 127.0.0.1 is computer hai, website nahi. Website tool start nahi karti. Pehle start-artwork-verification.bat chalao, kali window khuli rakho — tabhi woh address khulega.",
  startHeading: "Ya apne computer par chalao",
  startSteps: [
    "Python 3.11+ install karo. Install ke time Add python.exe to PATH tick karo, phir computer restart karo",
    "Repo root par start-artwork-verification.bat double-click (ya tools/artwork-verification/start-tool.bat)",
    "Kali window khuli rehne do. Server ready hone ke baad browser khulega: http://127.0.0.1:8765",
    "Wahan job banao, PDFs daalo, match chalao. Window band ki to Chrome phir se refused to connect dikhayega",
  ],
  backLabel: "All tools",
  backHref: "/tools",
};
