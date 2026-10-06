/**
 * /solutions copy. The page is a problem-first story, not a second homepage.
 * Later sections land in this file. The hero is the only section built so far.
 */

import { printSahajSite } from "./site";

export const solutions = {
  meta: {
    title: "Solutions | AI, Automation & Digital Solutions for Growing Businesses",
    description:
      "PrintSahaj helps growing businesses use AI, automation and digital tools to solve real problems — simply, practically and without unnecessary complexity.",
  },
  hero: {
    eyebrow: "Solutions for growing businesses",
    lines: ["You don't need more technology.", "You need the right technology."] as const,
    /** The words that take the same colour sweep as the homepage hero. */
    sweepWords: "right technology",
    supporting:
      "Running a business already comes with enough things to manage. We help you find the small things that can be made easier with AI, automation and simple digital tools — without turning everything into a big, expensive project.",
    primaryCta: {
      label: "Tell Us What Takes Too Much Time",
      href: printSahajSite.ctas.primary.href,
    },
    secondaryCta: {
      label: "See What We Can Help With",
      href: "#what-we-can-help-with",
    },
    figure: {
      /** Shown until a photograph is placed. Not a description of a picture that is not there. */
      label: "A working desk. The photograph comes later.",
      /** Used only once a real photograph is in `src`. */
      alt: "A business owner at a normal desk, laptop open, phone and papers nearby, thinking through the work.",
    },
  },
} as const;
