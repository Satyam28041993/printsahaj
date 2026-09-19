/**
 * /about copy. Company first, founder second.
 *
 * Products listed here are only those already public on this site.
 * PGLabelTrust and PGTechDrishti are not shown — they are not verified
 * for public display.
 */

import { home } from "./home";
import { printSahajSite } from "./site";

export const about = {
  meta: {
    title: "About",
    description:
      "PrintSahaj is a technology, AI and digital solutions company. Founded by Satyam Singh.",
  },
  company: {
    eyebrow: "About PrintSahaj",
    headline: "Technology built around real business problems.",
    supporting:
      "PrintSahaj is a technology, AI and digital solutions company helping businesses understand problems, build practical systems and make work simpler.",
    philosophy: printSahajSite.brand.philosophy,
    process: [
      { label: "Problem" },
      { label: "Understand" },
      { label: "Build" },
      { label: "Automate" },
      { label: "Improve" },
    ],
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: { label: "Explore Our Work", href: "/work" },
  },
  products: {
    heading: "What we build",
    supporting: "Practical systems for real business workflows.",
    featured: {
      name: "PrintVerify",
      status: "Building",
      description:
        "A pre-production verification product for checking important artwork and separation information before production.",
      href: "/products/printverify",
    },
    supportingItems: [
      {
        name: "Flexora",
        status: "Building",
        description: "ERP + HRMS platform designed for flexographic label printing workflows.",
        href: "/products/flexora",
      },
      {
        name: "CRM",
        status: "Lead management",
        description: "Enquiries, quotes and follow-ups for a customer, kept in one place.",
        href: "/crm/",
      },
    ],
    cta: { label: "Explore all products", href: "/products" },
  },
  founder: {
    eyebrow: "About the Founder",
    name: home.founder.name,
    role: "Founder, PrintSahaj",
    photo: home.founder.photo,
    linkedin: home.founder.linkedin,
    linkedinLabel: "View LinkedIn",
    quote: "Close enough to the press and the ground team to know where a system actually breaks.",
    quoteAttribution: "Satyam Singh",
    quoteRole: "Founder, PrintSahaj",
    summary:
      "12+ years across sales, operations and marketing — including last-mile logistics and hands-on work in label printing, packaging, anti-counterfeit and QR-based track & trace.",
    body: "PrintSahaj is being built from that same vantage point: close enough to the work to know where a system actually breaks.",
    contact: {
      phone: home.founder.contact.phone,
      email: home.founder.contact.email,
      address: "Sativali, Vasai East, Maharashtra, India",
      linkedin: home.founder.linkedin,
    },
    timeline: home.founder.timeline,
    timelineHeading: "Career Journey",
    expertiseHeading: "Core Expertise",
    expertise: [
      "Sales & Business Development",
      "Marketing & Growth",
      "Business Operations",
      "Printing & Packaging",
      "Anti-Counterfeit & Brand Protection",
      "QR / Track & Trace",
      "AI & Automation",
      "Digital Solutions",
      "Supply Chain & Logistics",
    ],
    educationHeading: "Education",
    education: home.founder.education,
    languagesHeading: "Languages",
    languages: home.founder.languages,
  },
  visitingCard: {
    eyebrow: "Digital Visiting Card",
    heading: "Keep my contact details handy.",
    supporting: "A contact file you can save — not a picture of this page.",
    downloadLabel: "Download Visiting Card",
    href: "/satyam-singh.vcf",
    filename: "Satyam-Singh-PrintSahaj.vcf",
    qrSrc: "/images/satyam-singh-qr.svg",
    qrAlt: "QR code linking to Satyam Singh’s LinkedIn profile",
  },
  pdf: {
    heading: "Download a printable profile",
    supporting: "A light A4 layout, formatted for reading — not a printout of the website.",
    buttonLabel: "Download PDF",
    documentTitle: "Satyam Singh — PrintSahaj",
  },
  cta: {
    heading: "Have a business problem worth solving?",
    supporting: "Tell us what you're trying to improve.",
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: printSahajSite.ctas.secondary,
  },
} as const;
