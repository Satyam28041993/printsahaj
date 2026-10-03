/**
 * Media slots for the showcase. Drop a file into web/public/showcase/ named
 * <slug>.webp (or .png) and/or <slug>.mp4 and flip the matching flag here: that
 * is all. (A static export cannot check whether a file exists at runtime, so the
 * flag is the switch; with no flag the animated mock-up stays.)
 * See web/docs/showcase.md. Screenshots are privacy-blurred before they are added.
 *
 * SHOWCASE_COLLAGES / HELP_COLLAGES (below) layer 2-3 crops of those same files
 * into one mock-up per panel; a slot with a collage shows it instead of the
 * single frame.
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
  flexora: "Flexora ERP · Plant Operations Command Center (live)",
  crm: "LeadTrack CRM · lead pipeline & dashboard",
  erp: "Flexora ERP · dashboard, pipeline and roll stock",
  website: "Client websites · packaging & manufacturing",
  marketing: "Lead pipeline from TradeIndia & IndiaMART · live (names blurred)",
  printverify: "PrintVerify · vendor plate check (artwork blurred)",
  aivy: "Aivy · AI assistant that books meetings and reminders",
};

/* ---- collages ------------------------------------------------------------
   Every layer is a CSS crop of a file already in public/showcase/ (all blurred
   and privacy-checked). Crop boxes are [x, y, w, h] in source pixels and stay
   inside the blurred areas: never widen one into an unblurred logo, name,
   phone, email or job detail. */

type Variant = CollageLayer["variant"];
type Extra = Partial<Pick<CollageLayer, "alt" | "fit" | "radius" | "place" | "ratio">>;

/** 1024 x 525 screenshots. */
const WIDE = { width: 1024, height: 525 } as const;
/** 1200 x 750 product slides (an app card on a baked-in backdrop). */
const SLIDE = { width: 1200, height: 750 } as const;

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

// Panels of the old pre-baked collages (website.webp / crm.webp).
const WEB_A: CropBox = [36, 36, 585, 440]; // packaging client site, large hero (logo + name blurred)
const WEB_B: CropBox = [656, 36, 333, 208]; // industrial client site hero
const WEB_C: CropBox = [656, 281, 333, 209]; // packaging client site hero
const CRM_B: CropBox = [650, 31, 339, 213]; // Lead Overview KPI tiles
const CRM_C: CropBox = [650, 276, 339, 214]; // Analytics filters
// App cards of the product slides (boxes from content/productSlides.ts).
const FX1: CropBox = [68, 106, 1064, 539];
const FX2: CropBox = [181, 57, 838, 637];
const FX3: CropBox = [68, 106, 1064, 539];
const FX4: CropBox = [180, 57, 840, 637];
// 7px inside the PrintVerify cards' rounded corners, so no light edge rings the frame.
const PV2: CropBox = [288, 104, 623, 543];
const PV3: CropBox = [301, 84, 598, 583];
/** Aivy's "Meeting" confirmation card, border fully inside (client name blurred). */
const AIVY_CARD: CropBox = [8, 166, 928, 176];

/* The small frames (tablet / card) round their own corners, so the slide cards
   use "fill" there: the whole card shows edge to edge, bigger and easier to read
   than a "card" fit inset inside a second frame. */

/** "Systems that work" (HomeShowcase), per tab slug. */
export const SHOWCASE_COLLAGES: Record<ShowcaseSlug, CollageSpec | undefined> = {
  flexora: {
    layout: "stack-right",
    layers: [
      full("flexora", "laptop", "Flexora ERP plant operations command center"),
      crop("flexora-2", SLIDE, FX2, "tablet"),
      crop("flexora-3", SLIDE, FX3, "browser", { ratio: 2 }),
    ],
  },
  crm: {
    layout: "stack-right",
    layers: [
      full("marketing", "laptop", "LeadTrack CRM lead pipeline"),
      crop("crm", WIDE, CRM_B, "tablet"),
      crop("crm", WIDE, CRM_C, "card"),
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
      full("printverify", "laptop", "PrintVerify vendor plate check"),
      crop("printverify-2", SLIDE, PV2, "tablet"),
      crop("printverify-3", SLIDE, PV3, "card"),
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
 *  never upscaled: the small 333px panels (WEB_B/C, CRM_B/C) only ever sit in front. */
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
      full("marketing", "browser", "Custom CRM pipeline with blurred leads"),
      crop("crm", WIDE, CRM_C, "tablet"),
    ],
  },
  erp: {
    layout: "fan",
    layers: [
      crop("flexora-1", SLIDE, FX1, "laptop", { alt: "Flexora ERP dashboard", ratio: 2 }),
      crop("flexora-3", SLIDE, FX3, "browser", { ratio: 2 }),
      crop("flexora-4", SLIDE, FX4, "tablet"),
    ],
  },
  // Off on purpose: the animated flow demo stays (the Aivy collage lives in the showcase's Aivy tab).
  automation: undefined,
  marketing: {
    layout: "stack-left",
    layers: [
      full("marketing", "laptop", "Lead pipeline from TradeIndia and IndiaMART"),
      crop("crm", WIDE, CRM_B, "tablet"),
      crop("crm", WIDE, CRM_C, "card"),
    ],
  },
  flexora: undefined,
  aivy: undefined,
  printverify: undefined,
};
