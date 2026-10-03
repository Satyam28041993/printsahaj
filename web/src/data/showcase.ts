/**
 * Media slots for the showcase. Drop a file into web/public/showcase/ named
 * <slug>.webp (or .png) and/or <slug>.mp4 and flip the matching flag here: that
 * is all. (A static export cannot check whether a file exists at runtime, so the
 * flag is the switch; with no flag the animated mock-up stays.)
 * See web/docs/showcase.md. Screenshots are privacy-blurred before they are added.
 */

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
  automation: { webp: true },
  marketing: { webp: true },
  aivy: { webp: true },
  printverify: { webp: true },
};

/** Intrinsic size of the screenshots (1024 x 525); the frame keeps this ratio, so nothing is cropped. */
export const SHOWCASE_SIZE = { width: 1024, height: 525 } as const;

/** One muted line under each frame. */
export const SHOWCASE_CAPTIONS: Record<ShowcaseSlug, string> = {
  flexora: "Flexora ERP · Plant Operations Command Center (live)",
  crm: "LeadTrack CRM · live lead dashboard",
  erp: "CRM + ERP for a machinery manufacturer · live (names blurred)",
  website: "Client website · Tricil Packaging",
  automation: "Automated label rate calculator · client employee portal",
  marketing: "Lead pipeline from TradeIndia & IndiaMART · live (names blurred)",
  printverify: "PrintVerify · vendor plate check (artwork blurred)",
  aivy: "Aivy · AI assistant that books meetings and reminders",
};
