/**
 * Media slots for the showcase. Drop a file into web/public/showcase/ named
 * <slug>.webp (or .png) and/or <slug>.mp4 and flip the matching flag here: that
 * is all. (A static export cannot check whether a file exists at runtime, so the
 * flag is the switch; with no flag the animated mock-up stays.)
 * See web/public/showcase/README.md.
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
  flexora: {},
  website: {},
  crm: {},
  erp: {},
  automation: {},
  marketing: {},
  aivy: {},
  printverify: {},
};
