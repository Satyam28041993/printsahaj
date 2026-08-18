/** Section 3 — the three points in production where an error can still be caught. */

export interface CheckStep {
  /** Ordinal, shown as 01 / 02 / 03. Production order is meaningful. */
  number: string;
  title: string;
  /** When in the job this runs. */
  timing: string;
  /** What is compared at this step. */
  items: string[];
  /** Plausible monospace output panel for this step. */
  output: string;
}

export interface ChecksContent {
  heading: string;
  steps: CheckStep[];
}

export const checks: ChecksContent = {
  heading: "Three points where an error can still be caught",
  steps: [
    {
      number: "01",
      title: "Incoming artwork",
      timing: "Before you quote.",
      items: [
        "Spelling across English and Indian languages",
        "Mandatory declarations",
        "Font size floors",
        "Barcode structure and check digit",
      ],
      output: [
        "Artwork pages           1",
        "Languages found         English, Hindi, Marathi",
        "",
        "Declaration block       present",
        "Smallest type           1.4 pt",
        "                        ── below 1.5 pt floor",
        "",
        "Barcode  EAN-13         8901234567894",
        "Check digit             4                 ✓",
        "Structure               decoded",
      ].join("\n"),
    },
    {
      number: "02",
      title: "Plate separations",
      timing: "Before the plates are made.",
      items: [
        "Plate count against the declared colour count",
        "Colour name mapping",
        "Text present in the artwork but on no plate",
        "Cylinder repeat and label geometry",
        "Mandatory declarations sitting on a single plate",
      ],
      output: [
        "Declared units          7  (6 COL + VARNISH)",
        "Separation pages        6",
        "                        ── mismatch",
        "",
        "Cylinder repeat         238.125 mm",
        "÷ 3.175                 75 teeth          ✓",
        "",
        '"DAILY PHARMA"          plate 7483 only',
        "                        ── single-plate dependency",
      ].join("\n"),
    },
    {
      number: "03",
      title: "Printed sample",
      timing: "At the press.",
      items: [
        "Photograph the pulled sample",
        "Confirms every plate is mounted and printing",
        "Under sixty seconds",
      ],
      output: [
        "Sample photographed     14:22",
        "Plates expected         7",
        "Plates detected         6",
        "",
        "VARNISH                 no coverage found",
        "                        ── review before run",
        "",
        "Elapsed                 41 s",
      ].join("\n"),
    },
  ],
};
