/**
 * PrintSahaj site chrome and global copy.
 *
 * Content principles:
 * 1. PrintSahaj is the umbrella brand.
 * 2. PrintVerify is one product, not the company identity.
 * 3. Printing & packaging is the strongest specialization, not the boundary.
 * 4. Marketing includes lead generation, lead management and conversion — not just content/social media.
 * 5. Technology + Marketing + Automation is a core differentiator.
 * 6. Never invent project facts.
 * 7. Never invent client permission.
 * 8. Never invent product status.
 * 9. Never invent metrics/results/testimonials.
 * 10. Do not use placeholders publicly.
 * 11. Keep public copy professional, precise and credible.
 * 12. Avoid generic agency buzzwords.
 *
 * `printSahajSite` is the approved company chrome for the future homepage.
 * `site` is the object current Logo / SiteNav / SiteFooter / layout / FinalCta
 * already import. Its values stay frozen until the UI implementation slice so
 * the live header, footer, and metadata do not change in this step.
 */

export type PageIntent =
  | "Product"
  | "Business Solution"
  | "Digital Growth & Marketing"
  | "Tool"
  | "Custom Project"
  | "Insight";

export type ProjectStatus =
  | "Live"
  | "Building"
  | "Concept"
  | "Internal"
  | "Not publicly disclosed";

export interface NavLink {
  label: string;
  href: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface IntentDefinition {
  id: PageIntent;
  label: PageIntent;
}

export interface PrintSahajSite {
  brand: {
    name: string;
    positioning: string;
    specialization: string;
    philosophy: string;
  };
  nav: {
    links: NavLink[];
    primaryCta: CtaLink;
  };
  intents: IntentDefinition[];
  ctas: {
    primary: CtaLink;
    secondary: CtaLink;
  };
  footer: {
    lines: string[];
    copyright: string;
    legal: NavLink[];
  };
  meta: {
    title: string;
    description: string;
  };
  contact: {
    /** CONTENT GAP — unconfirmed. Do not render until verified. */
    email: string | null;
    /** CONTENT GAP — placeholder number must not be used publicly. */
    whatsappNumber: string | null;
    emailPublic: boolean;
    whatsappPublic: boolean;
  };
}

/** Planned URLs. Route files are not created in this step. */
export const printSahajSite: PrintSahajSite = {
  brand: {
    name: "PrintSahaj",
    positioning: "Technology, AI & digital solutions for modern businesses.",
    specialization: "Deep expertise in printing & packaging.",
    philosophy: "Understand the problem. Build the system. Make the work simpler.",
  },
  nav: {
    links: [
      { label: "Solutions", href: "/solutions" },
      { label: "Products", href: "/products" },
      { label: "Tools", href: "/tools" },
      { label: "Work", href: "/work" },
      { label: "Insights", href: "/insights" },
      { label: "About", href: "/about" },
    ],
    primaryCta: { label: "Start a Project", href: "/contact" },
  },
  intents: [
    { id: "Product", label: "Product" },
    { id: "Business Solution", label: "Business Solution" },
    { id: "Digital Growth & Marketing", label: "Digital Growth & Marketing" },
    { id: "Tool", label: "Tool" },
    { id: "Custom Project", label: "Custom Project" },
    { id: "Insight", label: "Insight" },
  ],
  ctas: {
    primary: { label: "Start a Project", href: "/contact" },
    secondary: { label: "Explore Products", href: "/products" },
  },
  footer: {
    lines: [
      "Technology",
      "AI",
      "Automation",
      "Digital Growth & Marketing",
      "Business systems",
      "Digital solutions",
      "Deep expertise in printing & packaging",
    ],
    copyright: "© 2026 PrintSahaj. All rights reserved.",
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
  meta: {
    title: "PrintSahaj — Technology, AI & Digital Solutions for Modern Businesses",
    description:
      "Software, AI, automation and digital growth systems built around real business problems, with deep expertise in printing & packaging.",
  },
  contact: {
    email: null,
    whatsappNumber: null,
    emailPublic: false,
    whatsappPublic: false,
  },
};

export interface SiteContent {
  brand: {
    /** Bold half of the wordmark. */
    nameStrong: string;
    /** Light half of the wordmark. */
    nameLight: string;
    positioning: string;
  };
  nav: {
    links: NavLink[];
    cta: { label: string; href: string };
  };
  contact: {
    email: string;
    whatsappNumber: string;
    whatsappLabel: string;
    whatsappMessage: string;
  };
  footer: {
    line: string;
    legal: NavLink[];
    copyright: string;
  };
  meta: {
    title: string;
    description: string;
  };
}

/**
 * Live chrome currently bound to existing components.
 * Do not change these values until the homepage UI implementation is approved.
 */
export const site: SiteContent = {
  brand: {
    nameStrong: "Print",
    nameLight: "Sahaj",
    positioning: "Printing industry ka kaam sahaj.",
  },
  nav: {
    links: [
      { label: "Tools", href: "/tools" },
      { label: "Product", href: "/#product" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
    cta: { label: "Get early access", href: "#early-access" },
  },
  contact: {
    email: "hello@printsahaj.com",
    whatsappNumber: "919876543210",
    whatsappLabel: "Message us on WhatsApp",
    whatsappMessage: "Hello — I would like early access to PrintSahaj.",
  },
  footer: {
    line: "A verification system for India's printing and packaging industry. Built in Vasai, Maharashtra.",
    legal: [
      { label: "Tools", href: "/tools" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    copyright: "© 2026 PrintSahaj. All rights reserved.",
  },
  meta: {
    title: "PrintSahaj — The error your eyes will miss",
    description:
      "PrintSahaj compares your job specification, your client-approved artwork, and your plate separation PDFs against each other, and shows you exactly where they disagree. Built for Indian label and packaging converters.",
  },
};
