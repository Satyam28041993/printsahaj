/**
 * /solutions copy. The page is a problem-first story, not a second homepage.
 * Later sections land in this file. The hero, the workday, the approach,
 * and the five situations are built.
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
  approach: {
    title: "We start with the problem, not the product.",
    supporting:
      "Before we talk about software, AI or automation, we first understand how the work actually happens.",
    steps: [
      {
        id: "understand",
        number: "01",
        title: "Understand",
        question: "What is taking too much time?",
        body: ["We look at how the work happens today."],
      },
      {
        id: "find",
        number: "02",
        title: "Find",
        question: "Where is the real problem?",
        body: [
          "Sometimes it is a manual task.",
          "Sometimes it is poor communication.",
          "Sometimes it is simply an old way of doing things.",
        ],
      },
      {
        id: "simplify",
        number: "03",
        title: "Simplify",
        question: "What is the easiest way to fix it?",
        body: [
          "Maybe you need AI.",
          "Maybe automation.",
          "Maybe a simple tool.",
          "Maybe an existing solution is already enough.",
        ],
      },
      {
        id: "build",
        number: "04",
        title: "Build",
        question: "Only build what is actually useful.",
        body: ["If something needs to be built, we build it around your actual workflow."],
      },
    ],
  },
  areas: {
    id: "what-we-can-help-with",
    title: "So, what can technology actually do for your business?",
    supporting: ["More than most businesses realise.", "But less than most technology companies promise."] as const,
    automation: {
      id: "automation",
      number: "01",
      kicker: "Business automation",
      lines: ["Less repetitive work.", "More time for actual work."] as const,
      body: ["If your team keeps doing the same thing every day, there may be a better way."] as const,
      examples: [
        "Automatic reports",
        "Data entry",
        "Reminders",
        "Approvals",
        "Notifications",
        "Repetitive calculations",
        "Connecting different tools",
      ] as const,
      flow: ["Repeat", "Automate", "Done"] as const,
    },
    ai: {
      id: "ai",
      number: "02",
      kicker: "AI for business",
      lines: ["AI is useful when it saves you real work."] as const,
      body: ["You don't need AI everywhere.", "You need it where it actually helps."] as const,
      examples: [
        "Reading and organising information",
        "Summarising documents",
        "Answering common questions",
        "Finding information faster",
        "Generating first drafts",
        "Analysing business data",
        "Helping teams make better decisions",
      ] as const,
      figure: {
        label: "A person at a laptop, using a plain work tool. The photograph comes later.",
      },
    },
    software: {
      id: "software",
      number: "03",
      kicker: "Custom software",
      lines: ["Sometimes your business needs its own tool."] as const,
      body: [
        "When Excel, WhatsApp and multiple disconnected apps are no longer enough, we can build something around the way your team actually works.",
      ] as const,
      examples: [
        "Internal business apps",
        "Web applications",
        "Mobile apps",
        "Customer portals",
        "Dashboards",
        "Custom calculators",
        "Workflow systems",
      ] as const,
      screens: [
        {
          slug: "flexora",
          title: "Flexora plant command centre, demo data",
          href: "/products/flexora/",
          link: "See Flexora",
        },
        {
          slug: "crm",
          title: "CRM enquiry pipeline, demo data",
          href: "/crm/",
          link: "See the CRM",
        },
        {
          slug: "printverify",
          title: "PrintVerify vendor plate check, demo artwork",
          href: "/products/printverify/",
          link: "See PrintVerify",
        },
      ] as const,
    },
    workflows: {
      id: "workflows",
      number: "04",
      kicker: "Digital workflows",
      lines: ["Make information move with the work."] as const,
      body: ["When information is scattered across WhatsApp, email, Excel and paper, work gets delayed."] as const,
      examples: [
        "Lead management",
        "Approvals",
        "Task tracking",
        "Customer follow-up",
        "Document workflows",
        "Internal communication",
      ] as const,
      flow: ["People", "Information", "Process", "Action"] as const,
    },
    tools: {
      id: "tools",
      number: "05",
      kicker: "Business tools & dashboards",
      lines: ["Turn everyday business data into something useful."] as const,
      body: ["Your business already has data.", "The challenge is making it easy to understand and use."] as const,
      examples: ["Calculators", "Reports", "Dashboards", "Tracking tools", "Cost analysis", "Performance monitoring"] as const,
      link: { label: "Open the full calculator", href: "/calculators/?tab=label-rate" },
    },
  },
} as const;

export type SolutionFragmentKind = (typeof solutions.problem.items)[number]["kind"];
