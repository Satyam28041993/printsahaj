/**
 * Slides for the PrintVerify and Flexora product sections on the homepage.
 * Images live in web/public/showcase/ (1200 x 750, no baked-in text); the title and
 * line under each image are set from here, so they stay readable in light and dark.
 *
 * Each image has a light-grey backdrop baked in around a centred app card. `crop`
 * is that card in image pixels (measured from the files), so the DeviceFrame shows
 * only the app, never the backdrop: wide cards fill the screen ("fill", cropped
 * 7px inside the card's rounded corners), narrow ones sit centred as a card.
 */

import type { CropBox } from "@/components/landing/DeviceFrame";

export interface ProductSlide {
  src: string;
  title: string;
  text: string;
  crop: CropBox;
  fit: "fill" | "card";
  /** Corner radius of the card in image pixels (card fit only). */
  radius?: number;
}

export const PRINTVERIFY_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/printverify-1.webp",
    crop: [68, 106, 1064, 539], fit: "fill",
    title: "Approve before the plate hits press",
    text: "Artwork, vendor plates and printout checked in one place.",
  },
  {
    src: "/showcase/printverify-2.webp",
    crop: [281, 97, 637, 557], fit: "card", radius: 12,
    title: "Three steps, zero guesswork",
    text: "First approval, vendor plates, then the final printout.",
  },
  {
    src: "/showcase/printverify-3.webp",
    crop: [294, 77, 612, 597], fit: "card", radius: 12,
    title: "Every job, one tidy list",
    text: "Open any job and pick up exactly where you left off.",
  },
  {
    src: "/showcase/printverify-4.webp",
    crop: [68, 113, 1064, 525], fit: "fill",
    title: "Compare vendor plates side by side",
    text: "Upload the composite and spot every mismatch before printing.",
  },
];

export const FLEXORA_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/flexora-1.webp",
    crop: [68, 106, 1064, 539], fit: "fill",
    title: "Order to dispatch on one screen",
    text: "Your whole plant's command centre, live in one dashboard.",
  },
  {
    src: "/showcase/flexora-2.webp",
    crop: [181, 57, 838, 637], fit: "card", radius: 14,
    title: "Every job card tracked live",
    text: "PO orders, job cards, shade cards and QC releases at a glance.",
  },
  {
    src: "/showcase/flexora-3.webp",
    crop: [68, 106, 1064, 539], fit: "fill",
    title: "Production pipeline, stage by stage",
    text: "Pre-press to dispatch, every order's status in one view.",
  },
  {
    src: "/showcase/flexora-4.webp",
    crop: [180, 57, 840, 637], fit: "card", radius: 14,
    title: "Roll stock, always traceable",
    text: "Customers, roll inventory and machines, synced in real time.",
  },
];

export const SLIDE_SIZE = { width: 1200, height: 750 } as const;

/** Screen aspect of the slide frame: the wide cards are ~2:1, so they fill it. */
export const SLIDE_SCREEN_RATIO = 2;
