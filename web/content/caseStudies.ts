/**
 * Case studies — real jobs the engine has been run against.
 *
 * SOURCE OF EVERY FACT HERE, so any claim can be traced:
 *
 *   varnish-plate  — tools/artwork-verification/samples/kalonji/{job.json,README.md}.
 *                    `output` is verbatim: it is what check_plate_count emits for
 *                    that job.json at a page count of six. Reproduce with
 *                    check_plate_count(load_job_spec(samples/kalonji), 6).
 *   batch-mismatch — commit a5b2424, "Settle batch number and date by the value,
 *                    not by two AI opinions". No verbatim output captured, so the
 *                    case carries none.
 *   vendor-cover   — commit e7e3fe8, "Skip a vendor's report-cover page instead of
 *                    treating it as a plate". No verbatim output captured.
 *
 * Only `varnish-plate` has an `output` block. The other two describe what was
 * found in words, because inventing a tool output string would be inventing a
 * result — content rule 9 in content/home.ts, and the fastest way to lose a
 * buyer who asks to see it run.
 *
 * TO REVIEW (Satyam): the second and third cases are reconstructed from commit
 * messages, not from a run you watched. Correct anything wrong before treating
 * these as sales material.
 *
 * Content rule 7 — never invent client permission. Every `client` is null and
 * the pages render `clientFallback`. Fill a name in only once permission to use
 * it publicly is on file.
 */

export interface CaseFact {
  label: string;
  value: string;
}

export interface CaseUnit {
  name: string;
  swatch: string | null;
  present: boolean;
}

export interface CaseOutput {
  certainty: string;
  summary: string;
  expected: string;
  foundLine: string;
  location: string;
}

export interface CaseStudy {
  slug: string;
  /** The class of error, not the job. This is what a buyer scans for. */
  errorClass: string;
  title: string;
  /** One line, for the homepage strip. */
  teaser: string;
  standfirst: string;
  client: string | null;
  clientFallback: string;
  facts: CaseFact[];
  declared: { heading: string; note: string; units?: CaseUnit[]; lines?: string[] };
  found: { heading: string; note: string; lines?: string[] };
  /** Present only where the engine's real output was captured. */
  output: CaseOutput | null;
  consequence: string;
  /** Which of the engine's checks this job exercises. */
  checks: string[];
}

export const caseStudiesIntro = {
  eyebrow: "Case studies",
  heading: "Three jobs, three different ways a file can be wrong.",
  standfirst:
    "A missing plate is the easy one. These are the errors that survive a careful person reading the same files twice.",
  cta: { label: "Read the case studies", href: "/case-studies" },
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "varnish-plate",
    errorClass: "A declared unit with no plate",
    title: "The varnish plate that wasn't there.",
    teaser: "Seven units declared on the job sheet. Six plates in the separation file.",
    standfirst:
      "A seven-unit label went to plate-making as six. Nothing in the files looked wrong. The count was wrong.",
    client: null,
    clientFallback: "a pharma label customer",
    facts: [
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
      certainty: "deterministic",
      summary:
        "Declared 7 units (6 COL + VARNISH), found 6 separation pages. 1 unit(s) missing. Special units declared: Varnish.",
      expected: "7 units (6 COL + VARNISH)",
      foundLine: "6 separation pages",
      location: "Job sheet colour line vs separation PDF page count",
    },
    consequence:
      "A run printed from that file would have carried no varnish — on a pharma label, where the coating is part of the specification, not a finish.",
    checks: ["Plate count"],
  },
  {
    slug: "batch-mismatch",
    errorClass: "A value that disagrees with itself",
    title: "Two checks, two opinions, one batch number.",
    teaser: "The composite said the batch details matched. The Black plate said they did not.",
    standfirst:
      "The same field was read in two places and answered differently. Nothing in the report said which reading to believe — so the report itself was the problem.",
    client: null,
    clientFallback: "a personal-care label customer",
    facts: [
      { label: "Field", value: "Batch number, mfg date" },
      { label: "Read from", value: "Artwork, composite, each plate" },
      { label: "Certainty", value: "Deterministic" },
    ],
    declared: {
      heading: "What the old report said",
      note: "Two rows, formed independently, contradicting each other.",
      lines: [
        "Composite row: printed batch details matched.",
        "Black plate row: batch number and manufacturing dates differed.",
        "Nothing decided which of the two was right.",
      ],
    },
    found: {
      heading: "What it says now",
      note: "The values are read as values, then compared.",
      lines: [
        "The batch number and date are pulled as strings from the artwork, the composite and every plate.",
        "A single check compares those strings itself, so a mismatch is arithmetic rather than a judgement.",
        "It is reported as a certain finding, and only the source that disagrees is marked, line by line.",
        "A value printed on the production files but blank on the artwork is the coding window, and is not a finding.",
      ],
    },
    output: null,
    consequence:
      "A batch number that differs between the artwork and the printed plate is a labelling error on a regulated product. It is also the kind of difference two people reading two files will not see.",
    checks: ["Batch number and manufacturing date", "Plate-by-plate review"],
  },
  {
    slug: "vendor-cover",
    errorClass: "A vendor file that lies about its own shape",
    title: "The cover page that counted as a plate.",
    teaser: "One vendor ships a report page in front of the plates. Counted plainly, every job reads one plate long.",
    standfirst:
      "Not every separation PDF starts at plate one. One vendor puts a job specification report in front, and every plate-facing check downstream inherits that off-by-one.",
    client: null,
    clientFallback: "a plate-making vendor",
    facts: [
      { label: "File", value: "Separations PDF" },
      { label: "Page 1", value: "Job specification report" },
      { label: "Effect", value: "Plate count read 6, not 5" },
    ],
    declared: {
      heading: "What the file actually contains",
      note: "A cover, then the real one-ink plates.",
      lines: [
        "Page 1 is a full composite plus a header table, titled JOB SPECIFICATION REPORT.",
        "The real one-ink plates start at page 2.",
        "Counted plainly, the job reads one plate more than it has.",
      ],
    },
    found: {
      heading: "What the tool does about it",
      note: "Detect the cover, skip it, keep the page numbers honest.",
      lines: [
        "A cover is only detected on page 1, and only when it reads like one — the report title, or two or more of ARTWORK SIZE, OPERATOR, FILE NAME and JOB ID together.",
        "Plate count, per-plate identity, colour-name matching and the plate-by-plate review all work from the filtered list.",
        "Plates keep the real PDF page number a person would open, cover page or not.",
        "Verified against the vendor's own file: the plate count reads 5 of 5 against a declared 5 colours, with plates numbered 2 to 6.",
      ],
    },
    output: null,
    consequence:
      "An off-by-one here is worse than no check at all: it reports a plate that does not exist and mislabels every plate after it. A tool that gets this wrong teaches people to ignore it.",
    checks: ["Plate count", "Per-plate text map", "Colour name mapping", "Plate-by-plate review"],
  },
];
