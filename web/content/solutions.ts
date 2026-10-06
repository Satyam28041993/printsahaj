/**
 * /solutions copy. The page is a problem-first story, not a second homepage.
 * Later sections land in this file. The hero and the workday problem are built.
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
  problem: {
    lines: [
      "Most businesses don't have a technology problem.",
      "They have a “too much work” problem.",
    ] as const,
    items: [
      { id: "report", kind: "report", text: "A report takes two hours." },
      { id: "sheet", kind: "sheet", text: "The same information is entered in three places." },
      { id: "messages", kind: "messages", text: "Someone keeps checking WhatsApp for new leads." },
      { id: "sum", kind: "sum", text: "A simple calculation still happens in Excel." },
      { id: "reminder", kind: "reminder", text: "The owner has to ask someone for an update every time." },
      { id: "task", kind: "task", text: "A team spends hours doing something that could happen automatically." },
    ] as const,
    bridge: ["These may look like small problems.", "Together, they cost time, money and attention."] as const,
    sum: "Small problems add up.",
    next: "That's where technology can help.",
  },
} as const;

export type SolutionFragmentKind = (typeof solutions.problem.items)[number]["kind"];
