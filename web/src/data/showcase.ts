/**
 * Media slots for the showcase. Drop a file into web/public/showcase/ named
 * <slug>.webp (or .png) and/or <slug>.mp4 and flip the matching flag here: that
 * is all. (A static export cannot check whether a file exists at runtime, so the
 * flag is the switch; with no flag the animated mock-up stays.)
 * See web/docs/showcase.md.
 *
 * PrintVerify, Flexora and CRM panels use sharp demo screens in
 * public/showcase/hd/ (PrintSahaj sample data only). The website collage is the
 * three-site version (pgpl / ashokraj / tricil). The Aivy tab is the chat
 * demo in MiniUis, not the older meeting-card crop under public/showcase/.
 *
 * SHOWCASE_COLLAGES / HELP_COLLAGES layer those screens into one mock-up per
 * panel; a slot with a collage shows it instead of the single frame.
 */

import type { CollageLayer, CollageSpec } from "@/components/landing/DeviceCollage";
import type { CropBox } from "@/components/landing/DeviceFrame";

export type ShowcaseSlug =
  | "flexora"
  | "website"
  | "crm"
  | "erp"
  | "automation"
  | "marketing"
  | "aivy"
  | "printverify";

export interface ShowcaseMediaFlags {
  /** public/showcase/<slug>.webp exists */
  webp?: boolean;
  /** public/showcase/<slug>.png exists (used when there is no webp) */
  png?: boolean;
  /** public/showcase/<slug>.mp4 exists (muted loop; the image is its poster) */
  mp4?: boolean;
}

export const SHOWCASE_MEDIA: Record<ShowcaseSlug, ShowcaseMediaFlags> = {
  flexora: { webp: true },
  website: { webp: true },
  crm: { webp: true },
  erp: { webp: true },
  // Off on purpose: no screenshot for this slug, so the animated mock-up stays.
  automation: {},
  marketing: { webp: true },
  aivy: { webp: true },
  printverify: { webp: true },
};

/** Intrinsic size of the screenshots (1024 x 525); the frame keeps this ratio, so nothing is cropped. */
export const SHOWCASE_SIZE = { width: 1024, height: 525 } as const;

/** One muted line under each frame. */
export const SHOWCASE_CAPTIONS: Partial<Record<ShowcaseSlug, string>> = {
  flexora: "Flexora · plant command centre (demo data)",
  crm: "CRM · enquiry pipeline (demo data)",
  erp: "Flexora · dashboard and order-to-dispatch flow (demo data)",
  website: "Client websites · pgpltechprint · ashokraj · tricil",
  marketing: "CRM · enquiries, quotes and follow-ups (demo data)",
  printverify: "PrintVerify · vendor plate check (demo artwork)",
  aivy: "Aivy · AI assistant that books meetings and reminders",
};

/* ---- collages ------------------------------------------------------------
   HD product screens (public/showcase/hd/) are 2000 × 1250 dummy UIs. The back
   layer is the whole screen. The front layer is a zoomed crop of the same
   file (or the matching second screen) so its headings stay readable.
   The website collage is three whole first screens. Aivy stays a crop of the
   older privacy-checked file. */

type Variant = CollageLayer["variant"];
type Extra = Partial<Pick<CollageLayer, "alt" | "fit" | "radius" | "place" | "ratio">>;

/** 1024 x 525 screenshots (Aivy). */
const WIDE = { width: 1024, height: 525 } as const;
/** Sharp demo screens, 2000 × 1250. */
const HD = { width: 2000, height: 1250 } as const;

/* Front-layer crops, measured on the 2000 × 1250 files. Narrow enough that the
   tablet / browser (~44cqw) shows the type at more than 1.6× the back screen. */
/** Two KPI tiles plus the "QC rejection by reason" card. */
const FX_QC: CropBox = [1432, 108, 556, 610];
/** Quote-sent column: ENQ-2038 · Roll labels and its three steps. */
const CRM_COL: CropBox = [896, 272, 516, 520];
/** Vendor composite pane with the two mismatch callouts. */
const PV_VENDOR: CropBox = [1120, 480, 700, 620];
/** Circle track frozen on Production: stages 04–07 and the 68% detail. */
const FLOW_LATE: CropBox = [710, 170, 760, 760];

/** A whole 1024 x 525 screenshot. */
const full = (file: string, variant: Variant, alt = ""): CollageLayer => ({
  src: `/showcase/${file}.webp`,
  ...WIDE,
  ratio: WIDE.width / WIDE.height,
  variant,
  alt,
});

/** A crop; by default the frame takes the crop's own aspect, so "fill" shows all of it. */
const crop = (
  file: string,
  size: { width: number; height: number },
  box: CropBox,
  variant: Variant,
  extra: Extra = {},
): CollageLayer => ({
  src: `/showcase/${file}.webp`,
  ...size,
  crop: box,
  ratio: box[2] / box[3],
  alt: "",
  variant,
  ...extra,
});

/** Aivy's "Meeting" confirmation card, border fully inside (client name checked). */
const AIVY_CARD: CropBox = [8, 166, 928, 176];

/** A whole HD demo screen. Ratio follows the file so nothing is cropped away. */
const hd = (file: string, size: { width: number; height: number }, variant: Variant, alt = ""): CollageLayer => ({
  src: `/showcase/hd/${file}.webp`,
  ...size,
  ratio: size.width / size.height,
  variant,
  alt,
});

/* Client websites: three different sites, each a whole first screen (never a crop).
   Captured with Playwright (desktop 1440x900, mobile 390x844, DPR 2); client logos,
   phones, emails, and personal data blurred. */
const WEBSITES: CollageSpec = {
  layout: "site",
  layers: [
    {
      src: "/showcase/web-pgpl-full.webp",
      width: 1200,
      height: 676,
      // Cropped above the white band under the hero (banner is 810px of a 900px viewport).
      ratio: 1200 / 676,
      variant: "browser",
      url: "pgpltechprint.com",
      alt: "PGPL Group website (pgpltechprint.com), home page built by PrintSahaj",
    },
    // front = the tilted phone (on top), accent = the second browser (behind it)
    { src: "/showcase/web-tricil-mobile.webp", width: 520, height: 1125, ratio: 390 / 844, variant: "phone", alt: "" },
    { src: "/showcase/web-ashokraj.webp", width: 1200, height: 750, ratio: 1440 / 900, variant: "browser", alt: "" },
  ],
};

/** "Systems that work" (HomeShowcase), per tab slug. */
export const SHOWCASE_COLLAGES: Record<ShowcaseSlug, CollageSpec | undefined> = {
  flexora: {
    layout: "stack-right",
    layers: [
      hd("flexora-dashboard", HD, "laptop", "Flexora plant command centre"),
      crop("hd/flexora-dashboard", HD, FX_QC, "tablet"),
    ],
  },
  crm: {
    layout: "stack-right",
    layers: [
      hd("crm-pipeline", HD, "laptop", "CRM enquiry pipeline"),
      crop("hd/crm-pipeline", HD, CRM_COL, "tablet"),
    ],
  },
  website: WEBSITES,
  printverify: {
    layout: "stack-left",
    layers: [
      hd("printverify-1-job", HD, "laptop", "PrintVerify vendor plate check"),
      crop("hd/printverify-3-compare", HD, PV_VENDOR, "tablet"),
    ],
  },
  aivy: {
    layout: "stack-right",
    // The meeting card again, zoomed: wider than it is in the back, over the chat's empty lower area.
    layers: [full("aivy", "browser", "Aivy assistant drafting a meeting"), crop("aivy", WIDE, AIVY_CARD, "card", { place: "callout" })],
  },
  erp: undefined,
  automation: undefined,
  marketing: undefined,
};

/** "Where we can help you" (HelpScroll), per service slug. Layouts differ from the showcase on purpose.
 *  A back layer must come from a source region at least as wide as it renders at 1x (~480px), so it is
 *  never upscaled. */
export const HELP_COLLAGES: Record<ShowcaseSlug, CollageSpec | undefined> = {
  website: WEBSITES,
  crm: {
    layout: "stack-right",
    layers: [
      hd("crm-pipeline", HD, "browser", "CRM enquiry pipeline"),
      crop("hd/crm-pipeline", HD, CRM_COL, "tablet"),
    ],
  },
  erp: {
    layout: "fan",
    layers: [
      hd("flexora-dashboard", HD, "laptop", "Flexora plant command centre"),
      crop("hd/flexora-flow", HD, FLOW_LATE, "browser"),
    ],
  },
  // Off on purpose: the animated flow demo stays. The showcase Aivy tab is the chat demo.
  automation: undefined,
  marketing: {
    layout: "stack-left",
    layers: [
      hd("crm-lead", HD, "laptop", "CRM lead with enquiry, quote and follow-up"),
      crop("hd/crm-pipeline", HD, CRM_COL, "tablet"),
    ],
  },
  flexora: undefined,
  aivy: undefined,
  printverify: undefined,
};
