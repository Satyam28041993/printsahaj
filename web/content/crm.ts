/** PrintSahaj CRM landing banner. Draft copy — edit freely. */

export interface CrmHeroContent {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  standfirst: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /**
   * Path under web/public, e.g. "/videos/crm-demo.mp4". Leave empty until the
   * recording exists — the frame then shows a placeholder instead of a blank.
   */
  videoSrc: string;
  /** Still frame shown before the video loads. Optional. */
  posterSrc: string;
  videoLabel: string;
}

export const crmHero: CrmHeroContent = {
  eyebrow: "PrintSahaj CRM",
  heading: "Every enquiry, quote and job.",
  headingAccent: "In one window.",
  standfirst:
    "Follow a customer from the first call to dispatch — built for the way printing and packaging teams actually work.",
  primaryCta: { label: "Book a demo", href: "/contact/" },
  secondaryCta: { label: "See how it works", href: "#crm-demo" },
  videoSrc: "",
  posterSrc: "",
  videoLabel: "PrintSahaj CRM walkthrough",
};
