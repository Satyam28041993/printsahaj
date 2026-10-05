/**
 * Media slots for the showcase. Drop a file into web/public/showcase/ named
 * <slug>.webp (or .png) and/or <slug>.mp4 and flip the matching flag here: that
 * is all. (A static export cannot check whether a file exists at runtime, so the
 * flag is the switch; with no flag the animated mock-up stays.)
 * See web/docs/showcase.md.
 *
 * PrintVerify, Flexora and CRM panels use sharp demo screens in
 * public/showcase/hd/ (PrintSahaj sample data only). Website and Aivy still use
 * the older privacy-checked crops under public/showcase/.
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
  website: "Client websites · packaging & manufacturing",
  marketing: "CRM · enquiries, quotes and follow-ups (demo data)",
  printverify: "PrintVerify · vendor plate check (demo artwork)",
  aivy: "Aivy · AI assistant that books meetings and reminders",
};

/* ---- collages ------------------------------------------------------------
   HD product screens (public/showcase/hd/) are full dummy UIs. Their frame
   ratio matches the file, so the whole screen shows — no backdrop crop.
   Website and Aivy crops stay inside the older privacy-checked files. */

type Variant = CollageLayer["variant"];
type Extra = Partial<Pick<CollageLayer, "alt" | "fit" | "radius" | "place" | "ratio">>;

/** 1024 x 525 screenshots (website, Aivy). */
const WIDE = { width: 1024, height: 525 } as const;
/** Sharp demo screens, 3200 × 2000. The Flexora flow is letterboxed onto this
 *  frame in its own background so the whole trail stays visible. */
const HD = { width: 3200, height: 2000 } as const;

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

// Panels of the website collage (logo + name stay inside the privacy-checked blur).
const WEB_A: CropBox = [36, 36, 585, 440];
const WEB_B: CropBox = [656, 36, 333, 208];
const WEB_C: CropBox = [656, 281, 333, 209];
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

/** "Systems that work" (HomeShowcase), per tab slug. */
export const SHOWCASE_COLLAGES: Record<ShowcaseSlug, CollageSpec | undefined> = {
  flexora: {
    layout: "stack-right",
    layers: [
      hd("flexora-dashboard", HD, "laptop", "Flexora plant command centre"),
      hd("flexora-flow", HD, "tablet"),
    ],
  },
  crm: {
    layout: "stack-right",
    layers: [
      hd("crm-pipeline", HD, "laptop", "CRM enquiry pipeline"),
      hd("crm-lead", HD, "tablet"),
    ],
  },
  website: {
    layout: "fan",
    layers: [
      crop("website", WIDE, WEB_A, "browser", { alt: "Client website for a packaging manufacturer" }),
      crop("website", WIDE, WEB_B, "browser"),
      crop("website", WIDE, WEB_C, "browser"),
    ],
  },
  printverify: {
    layout: "stack-left",
    layers: [
      hd("printverify-1-job", HD, "laptop", "PrintVerify vendor plate check"),
      hd("printverify-3-compare", HD, "tablet"),
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
 *  never upscaled: the small website panels (WEB_B/C) only ever sit in front. */
export const HELP_COLLAGES: Record<ShowcaseSlug, CollageSpec | undefined> = {
  website: {
    layout: "stack-left",
    layers: [
      crop("website", WIDE, WEB_A, "browser", { alt: "Client website for a packaging manufacturer" }),
      crop("website", WIDE, WEB_B, "browser"),
      crop("website", WIDE, WEB_C, "browser"),
    ],
  },
  crm: {
    layout: "stack-right",
    layers: [
      hd("crm-pipeline", HD, "browser", "CRM enquiry pipeline"),
      hd("crm-lead", HD, "tablet"),
    ],
  },
  erp: {
    layout: "fan",
    layers: [
      hd("flexora-dashboard", HD, "laptop", "Flexora plant command centre"),
      hd("flexora-flow", HD, "browser"),
    ],
  },
  // Off on purpose: the animated flow demo stays (the Aivy collage lives in the showcase's Aivy tab).
  automation: undefined,
  marketing: {
    layout: "stack-left",
    layers: [
      hd("crm-lead", HD, "laptop", "CRM lead with enquiry, quote and follow-up"),
      hd("crm-pipeline", HD, "tablet"),
    ],
  },
  flexora: undefined,
  aivy: undefined,
  printverify: undefined,
};
