/**
 * Homepage-only copy for the future PrintSahaj homepage.
 * Components should consume this object instead of hard-coding marketing strings.
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
 * Do not use "The error your eyes will miss" here — that belongs on PrintVerify.
 */

import { printSahajSite, type CtaLink, type PageIntent, type ProjectStatus } from "./site";
import { tools } from "./tools";

export interface FounderTimelineItem {
  period: string;
  role: string;
  org: string;
  description: string;
  /** Marks the row that culminates the timeline, styled as the destination. */
  current?: boolean;
}

export interface HeroVideo {
  /** Path under web/public. Empty until the recording exists. */
  src: string;
  /** Still frame shown before the video loads. Optional. */
  poster: string;
  label: string;
}

export interface HomePillar {
  name: string;
  description: string;
  /**
   * Scannable form of `description`, for the pillar cards. Every entry is
   * lifted from the sentence above it — this is the same claim set short
   * enough to read at a glance, never a new claim.
   */
  highlights: string[];
}

export interface HomeProduct {
  name: string;
  status: ProjectStatus;
  positioning: string;
  /** Planned URL. Route is not created in this step. */
  href: string;
}

export interface HomeWorkItem {
  name: string;
  category: PageIntent;
  /** null = CONTENT GAP — NEEDS VERIFICATION. Do not guess. */
  status: ProjectStatus | null;
  description: string;
  url: string | null;
  public: boolean;
}

export interface CurrentlyBuildingItem {
  title: string;
  description: string;
  status: ProjectStatus;
  public: boolean;
}

export interface HomeContent {
  intent: PageIntent[];
  hero: {
    eyebrow: string;
    headline: string;
    supporting: string;
    specialization: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    video: HeroVideo;
  };
  whatIsPrintSahaj: {
    heading: string;
    paragraphs: string[];
    principleLines: string[];
  };
  pillars: {
    heading: string;
    items: HomePillar[];
  };
  selectedProducts: {
    heading: string;
    supporting: string;
    items: HomeProduct[];
    cta: CtaLink;
  };
  digitalGrowth: {
    heading: string;
    supporting: string;
    emphasis: string;
    funnel: string[];
    capabilities: string[];
  };
  specialization: {
    heading: string;
    supporting: string;
    topics: string[];
    closing: string;
  };
  selectedWork: {
    heading: string;
    supporting: string;
    items: HomeWorkItem[];
  };
  founder: {
    heading: string;
    name: string;
    role: string;
    description: string;
    /** Path under web/public. Null shows the initials mark instead. */
    photo: string | null;
    linkedin: string;
    /** Short capability tags, shown as chips under the name. */
    focus: string[];
    timeline: FounderTimelineItem[];
    note: string;
  };
  toolsTeaser: {
    heading: string;
    supporting: string;
    cta: CtaLink;
  };
  currentlyBuilding: {
    optional: true;
    items: CurrentlyBuildingItem[];
  };
  finalCta: {
    heading: string;
    supporting: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
  };
}

export const home: HomeContent = {
  intent: ["Business Solution", "Product", "Digital Growth & Marketing", "Custom Project"],
  hero: {
    eyebrow: "Technology, AI & digital solutions for modern businesses.",
    headline: "We build technology for businesses.",
    supporting:
      "Software, AI, automation and digital growth systems — built around real business problems.",
    specialization: "Deep expertise in printing & packaging.",
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: printSahajSite.ctas.secondary,
    video: {
      // Path under web/public, e.g. "/videos/crm-demo.mp4". Empty shows a placeholder.
      src: "",
      poster: "",
      label: "PrintSahaj CRM walkthrough",
    },
  },
  whatIsPrintSahaj: {
    heading: "Technology built around the way businesses actually work.",
    paragraphs: [
      "PrintSahaj brings software, AI, automation and digital growth together to solve real business problems.",
      "We don't start with technology for its own sake. We start by understanding the work, finding what can be improved, and building the right system around it.",
    ],
    principleLines: [
      "Understand the problem.",
      "Build the system.",
      "Make the work simpler.",
    ],
  },
  pillars: {
    heading: "What we build.",
    items: [
      {
        name: "Software & Business Systems",
        description:
          "Business software designed around real workflows — from CRM and lead management to ERP, internal systems, dashboards and custom applications.",
        highlights: [
          "CRM and lead management",
          "ERP and internal systems",
          "Dashboards and custom applications",
        ],
      },
      {
        name: "AI & Automation",
        description:
          "AI-powered assistants and automated workflows that reduce repetitive work, connect information and help teams move faster.",
        highlights: [
          "AI-powered assistants",
          "Automated workflows",
          "Reduce repetitive work",
        ],
      },
      {
        name: "Digital Growth & Marketing",
        description:
          "Lead generation, high-conversion websites, branding, SEO, digital marketing, CRM integration and marketing automation designed to connect traffic with actual business growth.",
        highlights: [
          "Lead generation",
          "High-conversion websites",
          "CRM integration and marketing automation",
        ],
      },
      {
        name: "Products & Industry Tools",
        description:
          "Purpose-built products, calculators and industry tools that solve focused problems and turn practical ideas into usable software.",
        highlights: [
          "Purpose-built products",
          "Calculators and industry tools",
          "Practical ideas as usable software",
        ],
      },
    ],
  },
  selectedProducts: {
    heading: "Products built for real problems.",
    supporting: "Focused products designed around specific business and industry needs.",
    items: [
      {
        name: "PrintVerify",
        status: "Building",
        positioning:
          "A pre-production verification product for checking important artwork and separation information before production.",
        href: "/products/printverify",
      },
      {
        name: "Flexora",
        status: "Building",
        positioning:
          "ERP + HRMS platform designed for flexographic label printing workflows.",
        href: "/products/flexora",
      },
    ],
    cta: printSahajSite.ctas.secondary,
  },
  digitalGrowth: {
    heading: "Marketing that connects all the way to conversion.",
    supporting:
      "Generating traffic is only the beginning. We connect acquisition, conversion and follow-up into one business system.",
    emphasis: "Marketing + Technology + Automation.",
    funnel: [
      "Traffic",
      "Landing Page",
      "Lead",
      "CRM",
      "Qualification",
      "Follow-up",
      "Conversion",
      "Reporting",
    ],
    capabilities: [
      "Lead Generation",
      "Lead Management",
      "Lead Qualification",
      "High-Conversion Websites",
      "Landing Pages",
      "Branding",
      "SEO",
      "Search Visibility",
      "Content Strategy",
      "Digital Marketing",
      "Marketing Automation",
      "CRM Integration",
      "Analytics",
      "Conversion Optimization",
    ],
  },
  specialization: {
    heading: "Deep expertise in printing & packaging.",
    supporting:
      "Our strongest domain expertise comes from working close to the real workflows of printing and packaging businesses.",
    topics: [
      "Printing",
      "Labels",
      "Flexible Packaging",
      "Packaging Machinery",
      "Pharma Packaging",
      "Production",
      "Prepress",
      "Costing",
      "Procurement",
      "Sales",
      "Marketing",
      "Business Workflows",
    ],
    closing:
      "That specialization shapes how we build — but it does not define the limits of who we can build for.",
  },
  selectedWork: {
    heading: "Built for real businesses.",
    supporting:
      "A selection of products, systems and digital work built around practical business problems.",
    items: [
      {
        name: "PrintVerify",
        category: "Product",
        status: "Building",
        description:
          "A pre-production verification product for checking important artwork and separation information before production.",
        url: "/products/printverify",
        public: true,
      },
      {
        name: "Flexora",
        category: "Product",
        status: "Building",
        description:
          "ERP + HRMS platform designed for flexographic label printing workflows.",
        url: "/products/flexora",
        public: true,
      },
      {
        name: "Pactech Nexus",
        category: "Business Solution",
        // CONTENT GAP — NEEDS VERIFICATION. Do not claim Live. Public name/permission not confirmed for homepage display.
        status: null,
        description: "",
        url: null,
        public: false,
      },
    ],
  },
  founder: {
    heading: "Built by someone who has run the work, not just studied it.",
    name: "Satyam Singh",
    role: "Founder, PrintSahaj · Sales & Marketing Manager, Prakruti Graphic Pvt Ltd",
    description:
      "Twelve years across sales, last-mile operations and marketing, the last two inside a label printing and packaging company — running growth for FMCG, pharma and agrochemical clients, and working hands-on on security labels, anti-counterfeit R&D and QR-based track & trace. PrintSahaj is being built from that same vantage point: close enough to the press and the ground team to know where a system actually breaks.",
    photo: "/images/satyam-singh.jpg",
    linkedin: "https://www.linkedin.com/in/satyam-singh-3b178883/",
    focus: [
      "Marketing & Growth",
      "Printing & Packaging",
      "Anti-Counterfeit & Track-Trace",
      "Business Systems & Ops",
    ],
    timeline: [
      {
        period: "2013 – 2017",
        role: "Senior Executive",
        org: "IndiaMART Intermesh",
        description:
          "Client acquisition end to end — appointments, pitching the company's packages, and cold-calling follow-ups to get accounts on board.",
      },
      {
        period: "2017 – 2020",
        role: "Team Leader",
        org: "V.K. Enterprises",
        description: "Ran a ground sales team against daily targets and market cash collection.",
      },
      {
        period: "2020 – 2022",
        role: "Hub Manager",
        org: "Khati Solution Pvt Ltd",
        description:
          "P&L owner for last-mile delivery hubs serving Big Basket Daily, JioMart, Dealshare, Flipkart Grocery, Grofers and Udaan. Built the driver-training program from scratch.",
      },
      {
        period: "2022 – 2023",
        role: "Business Development Manager",
        org: "Jibz India System",
        description:
          "P&L owner for a city-wide vehicle-attachment project across Uber, Rapido and Ola — hiring, training and incentives for field executives and drivers.",
      },
      {
        period: "2023 – Present",
        role: "Sales & Marketing Manager",
        org: "Prakruti Graphic Pvt Ltd",
        description:
          "Marketing and growth for label printing & packaging and security labels — digital campaigns, and hands-on work on anti-counterfeit R&D (holograms, microtext, tamper-evident design) and QR-based track & trace.",
      },
      {
        period: "Building now",
        role: "Founder",
        org: "PrintSahaj",
        description:
          "Bringing that same operating discipline — logistics, last-mile ops and hands-on print & packaging marketing — into software, AI and automation for other businesses.",
        current: true,
      },
    ],
    note: "Also pursuing an MBA in Logistics and Supply Chain Management (Suresh Gyan Vihar University, ongoing).",
  },
  toolsTeaser: {
    heading: tools.heading,
    supporting: tools.intro,
    cta: { label: "Open tools", href: "/tools" },
  },
  currentlyBuilding: {
    optional: true,
    items: [],
  },
  finalCta: {
    heading: "Have a business problem worth solving?",
    supporting:
      "Tell us what you're trying to improve. We'll help you figure out whether the answer is software, automation, marketing, or something else.",
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: printSahajSite.ctas.secondary,
  },
};
