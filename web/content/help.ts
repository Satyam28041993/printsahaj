/** Home — "Where we can help": the scroll-driven services sequence after the hero. */

export interface HelpService {
  /** Short name, set as the big 3D word. */
  title: string;
  /** The one line that says what is different about it. */
  promise: string;
  body: string;
  points: string[];
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
  scrollCue: string;
  services: HelpService[];
  consult: HelpConsult;
}

export const help: HelpContent = {
  eyebrow: "What we build",
  heading: "Where we can help you.",
  scrollCue: "Scroll",
  services: [
    {
      title: "Website Building",
      promise: "Not just a website. One that brings you business.",
      body: "SEO and speed are the basics — everyone promises them. We start from what your customers are trying to get done, build the site around that need, and give every visit a clear path to an enquiry.",
      points: ["Built around your customer's need", "Every page leads to an enquiry", "Fast, found and easy to update"],
    },
    {
      title: "Customized CRM",
      promise: "Not one CRM for everyone. One built around your problems.",
      body: "Most CRMs are built once and handed to every business. We first learn how your enquiries, quotes and follow-ups really move, then build the CRM around that — so it takes work away instead of adding it.",
      points: ["Mapped to your real workflow", "Solves your specific bottlenecks", "Your team actually uses it"],
    },
    {
      title: "ERP",
      promise: "Built for how your company works — not just your industry.",
      body: "An industry template still asks you to change how you work. We shape the ERP around your company's own way of doing things, so your people adopt it in days, not months.",
      points: ["Follows your process", "Quick for your team to adopt", "Grows as you grow"],
    },
    {
      title: "Automation Tools",
      promise: "The repeated work, done for you.",
      body: "Every business has tasks someone does the same way, every single day. We find them and automate them to your exact requirement — so your people spend their time on work that needs a person.",
      points: ["Built to your requirement", "Repetitive tasks, automated", "Hours back every week"],
    },
    {
      title: "Marketing & Lead Generation",
      promise: "Leads that turn into business.",
      body: "Getting leads is only half the job. We bring together systems, technology, digital marketing and AI to attract the right leads — and put a process behind them so they convert into customers.",
      points: ["The right leads, not just more", "A system that converts them", "Digital marketing, powered by AI"],
    },
  ],
  consult: {
    railLabel: "Let's talk",
    eyebrow: "Free consultation",
    title: "Just talk to us.",
    promise: "Understand what your business needs — before you spend on anything.",
    body: "Marketing, CRM, ERP or automation: tell us how your business runs today and we will suggest what makes sense for you, and what doesn't. The consultation is free and it is not a sales pitch. You are under no obligation to buy — the decision is always yours.",
    points: ["Free, no charge", "Honest suggestions", "No obligation to buy", "Your decision, always"],
    primaryCta: { label: "Book a free consultation", href: "/contact" },
    callCta: { label: "Call Now", href: "tel:+919650744197" },
  },
};
