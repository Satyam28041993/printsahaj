import { PHONE_TEL, WHATSAPP_URL } from "../src/data/contact";

/** Home — "Where we can help": the scroll-driven services sequence after the hero. */

export interface HelpService {
  /** Short name, set as the big 3D word. */
  title: string;
  /** The one line that says what is different about it. */
  promise: string;
  body: string;
  /** Each point opens to a one-line detail in the accordion. */
  points: { title: string; detail: string }[];
  /** Three short labels for the small demo animation: from → through → to. */
  flow: [string, string, string];
}

/** The closing card: talk it through first, no obligation to buy. */
export interface HelpConsult {
  railLabel: string;
  eyebrow: string;
  title: string;
  promise: string;
  body: string;
  points: string[];
  primaryCta: { label: string; href: string };
  callCta: { label: string; href: string };
}

export interface HelpContent {
  eyebrow: string;
  heading: string;
  /** Accessible name of the pill row, and the labels of its controls. */
  tablistLabel: string;
  pauseLabel: string;
  playLabel: string;
  /** Prefix of the small line under an open point: "<flowLabel> <step>". */
  flowLabel: string;
  services: HelpService[];
  consult: HelpConsult;
}

export const help: HelpContent = {
  eyebrow: "What we build",
  heading: "Where we can help you.",
  tablistLabel: "Services",
  pauseLabel: "Pause auto-advance",
  playLabel: "Play auto-advance",
  flowLabel: "Shown in the flow:",
  services: [
    {
      title: "Website Building",
      promise: "Not just a website. One that brings you business.",
      body: "SEO and speed are the basics — everyone promises them. We start from what your customers are trying to get done, build the site around that need, and give every visit a clear path to an enquiry.",
      points: [
        { title: "Built around your customer's need", detail: "We start from what your customers are trying to get done, then build the site around that." },
        { title: "Every page leads to an enquiry", detail: "Every visit gets a clear path to an enquiry." },
        { title: "Fast, found and easy to update", detail: "SEO and speed are the basics we cover, and the site stays easy to update." },
      ],
      flow: ["Visit", "Enquiry", "Follow-up"],
    },
    {
      title: "Customized CRM",
      promise: "Not one CRM for everyone. One built around your problems.",
      body: "Most CRMs are built once and handed to every business. We first learn how your enquiries, quotes and follow-ups really move, then build the CRM around that — so it takes work away instead of adding it.",
      points: [
        { title: "Mapped to your real workflow", detail: "We first learn how your enquiries, quotes and follow-ups really move." },
        { title: "Solves your specific bottlenecks", detail: "Built around your problems, not handed over as the same CRM everyone gets." },
        { title: "Your team actually uses it", detail: "It takes work away instead of adding it." },
      ],
      flow: ["Enquiry", "CRM", "Follow-up"],
    },
    {
      title: "ERP",
      promise: "Built for how your company works — not just your industry.",
      body: "An industry template still asks you to change how you work. We shape the ERP around your company's own way of doing things, so your people adopt it in days, not months.",
      points: [
        { title: "Follows your process", detail: "Shaped around your company's own way of doing things." },
        { title: "Quick for your team to adopt", detail: "No template asking you to change how you work, so people adopt it in days, not months." },
        { title: "Grows as you grow", detail: "Built around your company, so it keeps fitting as the company grows." },
      ],
      flow: ["Order", "Job", "Dispatch"],
    },
    {
      title: "Automation Tools",
      promise: "The repeated work, done for you.",
      body: "Every business has tasks someone does the same way, every single day. We find them and automate them to your exact requirement — so your people spend their time on work that needs a person.",
      points: [
        { title: "Built to your requirement", detail: "We find the tasks done the same way every day and automate them to your exact requirement." },
        { title: "Repetitive tasks, automated", detail: "The repeated work is done for you." },
        { title: "Hours back every week", detail: "Your people spend their time on work that needs a person." },
      ],
      flow: ["Task", "Rule", "Done"],
    },
    {
      title: "Marketing & Lead Generation",
      promise: "Leads that turn into business.",
      body: "Getting leads is only half the job. We bring together systems, technology, digital marketing and AI to attract the right leads — and put a process behind them so they convert into customers.",
      points: [
        { title: "The right leads, not just more", detail: "Systems, technology, digital marketing and AI, brought together to attract the right leads." },
        { title: "A system that converts them", detail: "A process behind the leads so they turn into customers." },
        { title: "Digital marketing, powered by AI", detail: "Digital marketing working together with systems, technology and AI." },
      ],
      flow: ["Campaign", "Lead", "Customer"],
    },
  ],
  consult: {
    railLabel: "Let's talk",
    eyebrow: "Free consultation",
    title: "Just talk to us.",
    promise: "Understand what your business needs — before you spend on anything.",
    body: "Marketing, CRM, ERP or automation: tell us how your business runs today and we will suggest what makes sense for you, and what doesn't. The consultation is free and it is not a sales pitch. You are under no obligation to buy — the decision is always yours.",
    points: ["Free, no charge", "Honest suggestions", "No obligation to buy", "Your decision, always"],
    primaryCta: { label: "Book a free consultation", href: WHATSAPP_URL },
    callCta: { label: "Call Now", href: PHONE_TEL },
  },
};
