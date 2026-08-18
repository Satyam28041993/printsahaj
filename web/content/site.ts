/**
 * Global site chrome: navigation, brand strings, contact details, footer.
 * Edit copy here — components never hardcode strings.
 */

export interface NavLink {
  label: string;
  href: string;
}

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

export const site: SiteContent = {
  brand: {
    nameStrong: "Print",
    nameLight: "Sahaj",
    positioning: "Printing industry ka kaam sahaj.",
  },
  nav: {
    links: [
      { label: "Product", href: "#product" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
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
