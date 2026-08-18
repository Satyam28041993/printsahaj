/** Hero section: eyebrow, headline, sub, CTA, and the plate-register visual. */

export type PlateKind = "process" | "spot" | "missing";

export interface PlateSpec {
  /** Monospace label drawn on the plate. */
  label: string;
  kind: PlateKind;
  /** CSS custom property holding this plate's ink colour. */
  colorVar: string;
}

export interface HeroContent {
  eyebrow: string;
  headlineLines: [string, string];
  sub: string;
  cta: { label: string; href: string };
  ctaNote: string;
  visual: {
    plates: PlateSpec[];
    missingPlate: PlateSpec;
    caption: string;
    /** Screen-reader description of the animated SVG. */
    altText: string;
  };
}

export const hero: HeroContent = {
  eyebrow: "Built inside a working label printing company in Vasai",
  headlineLines: [
    "The error your eyes will miss.",
    "Caught before the plate is made.",
  ],
  sub: "PrintSahaj compares your job specification, your client-approved artwork, and your plate separation PDFs against each other — and shows you exactly where they disagree.",
  cta: { label: "Get early access", href: "#early-access" },
  ctaNote:
    "Currently in development. Built for Indian label and packaging converters.",
  visual: {
    plates: [
      { label: "CYAN", kind: "process", colorVar: "var(--ink-cyan)" },
      { label: "MAGENTA", kind: "process", colorVar: "var(--ink-magenta)" },
      { label: "YELLOW", kind: "process", colorVar: "var(--ink-yellow)" },
      { label: "BLACK", kind: "process", colorVar: "var(--ink-key)" },
      { label: "617", kind: "spot", colorVar: "var(--ink-spot-a)" },
      { label: "7483", kind: "spot", colorVar: "var(--ink-spot-b)" },
    ],
    missingPlate: {
      label: "VARNISH",
      kind: "missing",
      colorVar: "var(--accent)",
    },
    caption: "Declared: 6 COL + VARNISH · Received: 6 plates",
    altText:
      "Six printing plate separations — cyan, magenta, yellow, black, spot 617 and spot 7483 — sliding into register to form one label, with a seventh slot below labelled VARNISH left empty.",
  },
};
