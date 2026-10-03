/**
 * Slides for the PrintVerify and Flexora product sections on the homepage.
 * Images live in web/public/showcase/ (1200 x 750, no baked-in text); the title and
 * line under each image are set from here, so they stay readable in light and dark.
 */

export interface ProductSlide {
  src: string;
  title: string;
  text: string;
}

export const PRINTVERIFY_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/printverify-1.webp",
    title: "Approve before the plate hits press",
    text: "Artwork, vendor plates and printout checked in one place.",
  },
  {
    src: "/showcase/printverify-2.webp",
    title: "Three steps, zero guesswork",
    text: "First approval, vendor plates, then the final printout.",
  },
  {
    src: "/showcase/printverify-3.webp",
    title: "Every job, one tidy list",
    text: "Open any job and pick up exactly where you left off.",
  },
  {
    src: "/showcase/printverify-4.webp",
    title: "Compare vendor plates side by side",
    text: "Upload the composite and spot every mismatch before printing.",
  },
];

export const FLEXORA_SLIDES: ProductSlide[] = [
  {
    src: "/showcase/flexora-1.webp",
    title: "Order to dispatch on one screen",
    text: "Your whole plant's command centre, live in one dashboard.",
  },
  {
    src: "/showcase/flexora-2.webp",
    title: "Every job card tracked live",
    text: "PO orders, job cards, shade cards and QC releases at a glance.",
  },
  {
    src: "/showcase/flexora-3.webp",
    title: "Production pipeline, stage by stage",
    text: "Pre-press to dispatch, every order's status in one view.",
  },
  {
    src: "/showcase/flexora-4.webp",
    title: "Roll stock, always traceable",
    text: "Customers, roll inventory and machines, synced in real time.",
  },
];

export const SLIDE_SIZE = { width: 1200, height: 750 } as const;
