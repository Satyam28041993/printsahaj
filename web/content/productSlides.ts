/**
 * Slides for the PrintVerify and Flexora sections on the homepage.
 * Images live in web/public/showcase/hd/ — full dummy UIs (PrintSahaj sample
 * data only). The frame matches the image, so the whole screen shows.
 * Title and line under each image are set here, so they stay readable in
 * light and dark.
 */

import type { CropBox } from "@/components/landing/DeviceFrame";

export interface ProductSlide {
  src: string;
  title: string;
  text: string;
  /** Full-image box. The picture is the UI, so this is the whole file. */
  crop: CropBox;
  fit: "fill" | "card";
  /** Corner radius of the card in image pixels (card fit only). */
  radius?: number;
}

export const SLIDE_SIZE = { width: 3200, height: 2000 } as const;

/** Screen aspect of the slide frame: the HD screens are 3200 × 2000. */
export const SLIDE_SCREEN_RATIO = SLIDE_SIZE.width / SLIDE_SIZE.height;

const FULL: CropBox = [0, 0, SLIDE_SIZE.width, SLIDE_SIZE.height];

export const PRINTVERIFY_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/hd/printverify-1-job.webp",
    crop: FULL,
    fit: "fill",
    title: "Approve before the plate hits press",
    text: "Artwork, vendor plates and printout checked in one place.",
  },
  {
    src: "/showcase/hd/printverify-2-jobs.webp",
    crop: FULL,
    fit: "fill",
    title: "Every job, one tidy list",
    text: "Open any job and pick up exactly where you left off.",
  },
  {
    src: "/showcase/hd/printverify-3-compare.webp",
    crop: FULL,
    fit: "fill",
    title: "Compare vendor plates side by side",
    text: "Upload the composite and spot every mismatch before printing.",
  },
  {
    src: "/showcase/hd/printverify-4-separations.webp",
    crop: FULL,
    fit: "fill",
    title: "Flags anything missing",
    text: "Counts colours, varnish and special units, and flags anything missing or extra.",
  },
];

export const FLEXORA_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/hd/flexora-dashboard.webp",
    crop: FULL,
    fit: "fill",
    title: "Order to dispatch on one screen",
    text: "Your whole plant's command centre, live in one dashboard.",
  },
  {
    src: "/showcase/hd/flexora-flow.webp",
    crop: FULL,
    fit: "fill",
    title: "Production pipeline, stage by stage",
    text: "Pre-press to dispatch, every order's status in one view.",
  },
];
