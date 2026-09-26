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

export interface FounderEducation {
  period: string;
  qualification: string;
  institute: string;
}

export interface FounderLanguage {
  name: string;
  level: string;
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

export interface HomeSystemStep {
  label: string;
  hint: string;
}

export interface HomeProblemContent {
  kicker: string;
  statement: string;
  statementSecond: string;
  supporting: string;
  fragments: string[];
  bridge: string;
  connected: string;
  connectedHint: string;
}

export interface HomeJourneyStage {
  number: string;
  title: string;
  summary: string;
  visual: "problem" | "understand" | "build" | "automate" | "grow";
}

export interface HomeJourneyContent {
  kicker: string;
  heading: string;
  supporting: string;
  stages: HomeJourneyStage[];
}

export interface HomeIdentityStage {
  label: string;
  detail: string;
}

export interface HomeIdentityField {
  label: string;
  value: string;
}

export interface HomeIdentityContent {
  kicker: string;
  heading: string;
  supporting: string;
  stages: HomeIdentityStage[];
  scanLabel: string;
  resultLabel: string;
  fields: HomeIdentityField[];
  note: string;
}

export interface HomeEcosystemNode {
  name: string;
  kind: "product" | "tool";
  tag: string;
  description: string;
  href: string;
}

export interface HomeEcosystemContent {
  heading: string;
  supporting: string;
  hub: string;
  hubLine: string;
  products: HomeEcosystemNode[];
  tools: HomeEcosystemNode[];
}

export interface HomeProofItem {
  name: string;
  status: ProjectStatus | null;
  caption: string;
  href: string;
  visual: "printverify" | "flexora" | "crm" | "tools";
}

export interface HomeProofContent {
  heading: string;
  supporting: string;
  items: HomeProofItem[];
}

export interface HomeFaqItem {
  question: string;
  answer: string;
}

export interface HomeFaqContent {
  heading: string;
  items: HomeFaqItem[];
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
    /** Circular banner artwork on the left of the hero. */
    visual: { src: string; alt: string };
    system: {
      ariaLabel: string;
      spine: HomeSystemStep[];
      satellites: HomeSystemStep[];
    };
  };
  problem: HomeProblemContent;
  whatIsPrintSahaj: {
    heading: string;
    paragraphs: string[];
    principleLines: string[];
  };
  journey: HomeJourneyContent;
  pillars: {
    heading: string;
    supporting: string;
    items: HomePillar[];
  };
  identity: HomeIdentityContent;
  ecosystem: HomeEcosystemContent;
  proof: HomeProofContent;
  faq: HomeFaqContent;
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
    contact: { phone: string; email: string };
    /** Short capability tags, shown as chips under the name. */
    focus: string[];
    throughline: string;
    timeline: FounderTimelineItem[];
    note: string;
    education: FounderEducation[];
    languages: FounderLanguage[];
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
    flow: string[];
  };
}

export const home: HomeContent = {
  intent: ["Business Solution", "Product", "Digital Growth & Marketing", "Custom Project"],
  hero: {
    eyebrow: "Technology, AI & digital solutions for modern businesses.",
    headline: "We turn business problems into working systems.",
    supporting:
      "Software, AI, automation and digital growth — connected so the work actually moves.",
    specialization: "Deep expertise in printing & packaging.",
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: printSahajSite.ctas.secondary,
    video: {
      // Path under web/public, e.g. "/videos/crm-demo.mp4". Empty shows a placeholder.
      src: "",
      poster: "",
      label: "PrintSahaj CRM walkthrough",
    },
    visual: {
      src: "/assets/hero-ecosystem.webp",
      alt: "PrintSahaj at the centre, connected to CRM, ERP, business automation tools, websites and business growth with technology.",
    },
    system: {
      ariaLabel: "How PrintSahaj turns a business problem into a working system",
      spine: [
        { label: "Business problem", hint: "The work as it runs today" },
        { label: "Understand", hint: "See the real workflow" },
        { label: "System", hint: "Build around that work" },
        { label: "Automation", hint: "Connect the repetitive steps" },
        { label: "Result", hint: "A system people can use" },
      ],
      satellites: [
        { label: "CRM", hint: "Records" },
        { label: "QR", hint: "Identity" },
        { label: "Verification", hint: "Checks" },
        { label: "Workflow", hint: "Routing" },
        { label: "Analytics", hint: "Reporting" },
        { label: "Automation", hint: "Follow-up" },
      ],
    },
  },
  problem: {
    kicker: "The problem",
    statement: "Businesses don't need more software.",
    statementSecond: "They need systems that fit the way the work actually happens.",
    supporting:
      "Most teams already have tools. The work still lives in fragments — messages, sheets, paper, and follow-up that never quite meet.",
    fragments: [
      "WhatsApp",
      "Email",
      "Excel",
      "Paper",
      "Manual follow-up",
      "Disconnected data",
    ],
    bridge: "PrintSahaj system",
    connected: "Connected workflow",
    connectedHint: "Information, people and next steps in one path.",
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
  journey: {
    kicker: "How PrintSahaj builds",
    heading: "Understand the problem. Build the system. Make the work simpler.",
    supporting:
      "The public philosophy stays the same. The work behind it is a sequence: see the problem, understand it, build the system, automate what should not be manual, then help the business grow.",
    stages: [
      {
        number: "01",
        title: "Problem",
        summary: "The work is already happening — in messages, sheets, paper and follow-up that do not meet.",
        visual: "problem",
      },
      {
        number: "02",
        title: "Understand",
        summary: "We start by understanding the work, not by picking a tool. The system has to fit how the job actually runs.",
        visual: "understand",
      },
      {
        number: "03",
        title: "Build",
        summary: "Software around real workflows — CRM, internal systems, dashboards, custom applications, and focused products.",
        visual: "build",
      },
      {
        number: "04",
        title: "Automate",
        summary: "AI-powered assistants and automated workflows that reduce repetitive work and connect information.",
        visual: "automate",
      },
      {
        number: "05",
        title: "Grow",
        summary: "Traffic, landing pages, leads, CRM and follow-up as one path — not marketing sitting beside the business.",
        visual: "grow",
      },
    ],
  },
  pillars: {
    heading: "What we build.",
    supporting: "Four parts of one ecosystem — not four separate service menus.",
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
  identity: {
    kicker: "Digital identity",
    heading: "From a product to a verified identity.",
    supporting:
      "A physical product can carry a unique code. A scan can open a record. That record can be checked, traced, and connected to the data behind it. This is the kind of identity system PrintSahaj builds — from QR-based track and trace work already done in the field, not a generic code generator.",
    stages: [
      { label: "Product", detail: "The physical item or label." },
      { label: "Unique QR", detail: "A code that belongs to that item." },
      { label: "Scan", detail: "A camera reads the code." },
      { label: "Verify", detail: "The record is checked against what should be there." },
      { label: "Trace", detail: "The path of that identity can be followed." },
      { label: "Data", detail: "Batch, events and history sit behind the scan." },
    ],
    scanLabel: "Scan",
    resultLabel: "Identity found",
    fields: [
      { label: "Product identity", value: "Unique record" },
      { label: "Batch", value: "Linked to the scan" },
      { label: "Trace event", value: "Scan recorded" },
      { label: "Verification history", value: "Previous checks kept" },
    ],
    note: "This demonstrates the flow. It is not a live customer scan, and it does not grade a printed code.",
  },
  ecosystem: {
    heading: "A connected PrintSahaj ecosystem.",
    supporting:
      "The company sits in the middle. Products and tools around it are the ones that exist in this site today.",
    hub: "PrintSahaj",
    hubLine: "Software, AI, automation, digital growth and tools — connected.",
    products: [
      {
        name: "PrintVerify",
        kind: "product",
        tag: "Building",
        description:
          "A pre-production verification product for checking important artwork and separation information before production.",
        href: "/products/printverify",
      },
      {
        name: "Flexora",
        kind: "product",
        tag: "Building",
        description: "ERP + HRMS platform designed for flexographic label printing workflows.",
        href: "/products/flexora",
      },
      {
        name: "CRM",
        kind: "product",
        tag: "Lead management",
        description: "Enquiries, quotes and follow-ups for a customer, kept in one place.",
        href: "/crm/",
      },
    ],
    tools: [
      {
        name: "Label Rate & Matrix Costing",
        kind: "tool",
        tag: "Live",
        description: "Roll-label costing from size, gaps, ₹/sqm paper rate, ink, varnish and wastage.",
        href: "/calculators/?tab=label-rate",
      },
      {
        name: "Flexo Cylinder Repeat",
        kind: "tool",
        tag: "Live",
        description: "Teeth to repeat for 1/8 inch circular pitch. Repeat (mm) = Teeth × 3.175.",
        href: "/calculators/?tab=gear-repeat",
      },
      {
        name: "Indian Sheet Ups Planner",
        kind: "tool",
        tag: "Live",
        description: "Mono carton layout optimizer for Demy, Crown, Royal and other Indian sheet sizes.",
        href: "/calculators/?tab=sheet-ups",
      },
      {
        name: "GSM to Ream & Sheet Weight",
        kind: "tool",
        tag: "Live",
        description: "Indian ream formula: (Length in × Width in × GSM) ÷ 3100 for 500 sheets.",
        href: "/calculators/?tab=gsm-weight",
      },
      {
        name: "Corrugated Bursting Strength",
        kind: "tool",
        tag: "Live",
        description: "3-ply board bursting strength estimator with 1.45 flute take-up.",
        href: "/calculators/?tab=corrugated-bf",
      },
    ],
  },
  proof: {
    heading: "We don't just talk about systems. We build them.",
    supporting:
      "Interface fragments below follow the products and tools that already exist. They are not screenshots of unshipped work, and they do not invent modules.",
    items: [
      {
        name: "PrintVerify",
        status: "Building",
        caption:
          "Artwork, approval sheet and plate files held together. Findings say how sure they are — not approved or rejected.",
        href: "/products/printverify",
        visual: "printverify",
      },
      {
        name: "Flexora",
        status: "Building",
        caption: "ERP + HRMS shaped around order, job and system — still being built, so this page does not list unshipped modules.",
        href: "/products/flexora",
        visual: "flexora",
      },
      {
        name: "CRM",
        status: null,
        caption: "A customer record: enquiry, quote and follow-up in one window.",
        href: "/crm/",
        visual: "crm",
      },
      {
        name: "Industry tools",
        status: "Live",
        caption: "Label rate, cylinder repeat, sheet ups, GSM weight and bursting strength — calculators that already run.",
        href: "/tools",
        visual: "tools",
      },
    ],
  },
  faq: {
    heading: "Questions about PrintSahaj",
    items: [
      {
        question: "What does PrintSahaj build?",
        answer:
          "PrintSahaj is a technology company. We build software and business systems, AI and automation, digital growth and marketing systems, and products and industry tools — around real business problems.",
      },
      {
        question: "Do you build custom software?",
        answer:
          "Yes. CRM, ERP, internal systems, dashboards and custom applications are part of Software & Business Systems. The starting point is the work, not a template.",
      },
      {
        question: "Can you automate an existing workflow?",
        answer:
          "Yes. We look at the repetitive steps first — follow-up, routing, document handling, connecting information — and build automation around the workflow you already run.",
      },
      {
        question: "Can you build internal tools?",
        answer:
          "Yes. Internal systems, dashboards, calculators and focused industry tools are a core part of the work. Some of those tools are already public on this site.",
      },
      {
        question: "Do you work with existing systems?",
        answer:
          "We start from the work you already do. New software is only useful if it fits that work. What can be connected, and how, depends on the systems in front of us — we do not claim a universal integration list.",
      },
      {
        question: "Do you only work in one industry?",
        answer:
          "No. Printing and packaging is our strongest domain expertise. It shapes how we build, but it does not define the limits of who we can build for.",
      },
    ],
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
    contact: { phone: "+91 9650744197", email: "singhsatyam28@gmail.com" },
    focus: [
      "Marketing & Growth",
      "Printing & Packaging",
      "Anti-Counterfeit & Track-Trace",
      "Business Systems & Ops",
    ],
    throughline: "Real-world experience → understanding workflows → building systems.",
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
    education: [
      {
        period: "2023 – Ongoing",
        qualification: "MBA, Logistics and Supply Chain Management",
        institute: "Suresh Gyan Vihar University, Jaipur",
      },
      {
        period: "2010 – 2013",
        qualification: "B.Com",
        institute: "Mumbai University",
      },
      {
        period: "2008 – 2010",
        qualification: "Higher Secondary, Maths & Information Technology",
        institute: "Viva College, Virar",
      },
      {
        period: "2007 – 2008",
        qualification: "Secondary School, Maths & Science",
        institute: "R.I.S., Nala Sopara",
      },
    ],
    languages: [
      { name: "Hindi", level: "Mother tongue" },
      { name: "Marathi", level: "Proficient" },
      { name: "English", level: "Independent user" },
    ],
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
    supporting: "Tell us what you're trying to improve.",
    primaryCta: printSahajSite.ctas.primary,
    secondaryCta: printSahajSite.ctas.secondary,
    flow: ["Problem", "System", "Automation", "Growth"],
  },
};
