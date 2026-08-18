/** Section 2 — three documents that are never seen together. */

export interface DocumentCard {
  /** Monospace tab label on the document card. */
  kicker: string;
  title: string;
  /** Body lines rendered in monospace, as production data. */
  lines: string[];
  caption: string;
}

export interface ProblemContent {
  headingLines: [string, string, string];
  cards: DocumentCard[];
  convergenceLine: string;
  vendorQuote: string;
  vendorQuoteCaption: string;
}

export const problem: ProblemContent = {
  headingLines: [
    "Three documents.",
    "Three inboxes.",
    "Never on the same screen.",
  ],
  cards: [
    {
      kicker: "DOC 01",
      title: "Job specification sheet",
      lines: [
        "6 COL + VARNISH",
        "Yellow · Magenta · Cyan · Black · Gold · P 7483 C",
        "Label 114 × 76 mm  ·  Chromo  ·  Flexo",
      ],
      caption: "Approved by the client on 17 April.",
    },
    {
      kicker: "DOC 02",
      title: "Plate separations",
      lines: ["6 pages", "Cyan · Magenta · Yellow · Black · 617 · 7483"],
      caption: "Received from the plate vendor on 20 April.",
    },
    {
      kicker: "DOC 03",
      title: "Composite proof",
      lines: ["Header: Col: 6"],
      caption: "Attached to the same email.",
    },
  ],
  convergenceLine:
    "The varnish plate is missing. Nobody saw it, because nobody could see all three at once.",
  vendorQuote: "Customers are advised to check plates carefully before printing.",
  vendorQuoteCaption:
    "Printed on the plate vendor's proof. The responsibility is yours. The tools are not.",
};
