/**
 * The one case study on the homepage.
 *
 * Every value here is taken from a real job in the repository
 * (`tools/artwork-verification/samples/kalonji/`) and from the engine's own
 * output for it. Nothing on this page is illustrative. If a number here
 * cannot be reproduced by running the tool on that job, it does not belong.
 *
 * Content rules that apply, from content/home.ts:
 *   6. Never invent project facts.
 *   7. Never invent client permission.
 *   9. Never invent metrics/results/testimonials.
 * and the product rule from AGENTS.md: never output PASS, APPROVED, FAIL or
 * COMPLIANT. The tool reports findings; a person decides.
 */

export interface CaseStudyUnit {
  name: string;
  /** Swatch colour. null for a unit that is not an ink. */
  swatch: string | null;
  /** False when this unit had no plate in the separation file. */
  present: boolean;
}

export interface CaseStudyContent {
  eyebrow: string;
  heading: string;
  standfirst: string;
  /**
   * CONTENT GAP — the customer on this job is a real company. Keep this null
   * until written permission to name them is on file; the section reads
   * correctly either way.
   */
  client: string | null;
  clientFallback: string;
  job: { label: string; value: string }[];
  declared: { heading: string; note: string; units: CaseStudyUnit[] };
  found: { heading: string; note: string };
  output: {
    heading: string;
    certainty: string;
    summary: string;
    expected: string;
    foundLine: string;
    location: string;
  };
  consequence: string;
  notDecided: string;
}

export const caseStudy: CaseStudyContent = {
  eyebrow: "Case study — flexo label, pharma",
  heading: "The varnish plate that wasn't there.",
  standfirst:
    "A seven-unit label went to plate-making as six. Nothing in the files looked wrong. The count was wrong.",
  client: null,
  clientFallback: "a pharma label customer",
  job: [
    { label: "Job", value: "CGM2026-27-1326" },
    { label: "Label", value: "100 ml, 114 × 76 mm" },
    { label: "Process", value: "Flexo on chromo" },
    { label: "Colour line", value: "6 COL + VARNISH" },
  ],
  declared: {
    heading: "The job sheet declared 7 units",
    note: "Six inks and one special.",
    units: [
      { name: "Yellow", swatch: "#fff200", present: true },
      { name: "Magenta", swatch: "#ec008c", present: true },
      { name: "Cyan", swatch: "#00aeef", present: true },
      { name: "Black", swatch: "#1a1d22", present: true },
      { name: "Gold", swatch: "#b08d3f", present: true },
      { name: "P 7483 C", swatch: "#4a7729", present: true },
      { name: "Varnish", swatch: null, present: false },
    ],
  },
  found: {
    heading: "The separation file held 6 plates",
    note: "One short. The varnish had no plate.",
  },
  output: {
    heading: "What the tool reported",
    certainty: "deterministic",
    summary:
      "Declared 7 units (6 COL + VARNISH), found 6 separation pages. 1 unit(s) missing. Special units declared: Varnish.",
    expected: "7 units (6 COL + VARNISH)",
    foundLine: "6 separation pages",
    location: "Job sheet colour line vs separation PDF page count",
  },
  consequence:
    "A run printed from that file would have carried no varnish — on a pharma label, where the coating is part of the specification, not a finish.",
  notDecided:
    "The tool did not approve this job and did not reject it. It counted, found a gap, and said so. Colour accuracy, trap and overprint intent, and anything a person should judge stay with the person.",
};
