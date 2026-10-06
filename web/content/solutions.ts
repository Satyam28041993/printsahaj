/**
 * /solutions copy. The page is a problem-first story, not a second homepage.
 * Later sections land in this file. The hero, the workday, the approach,
 * the five situations, the trust break, the business environments,
 * printing experience, starting small, the principles, and the close are built.
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
      label: "A working desk. The photograph comes later.",
      src: "/images/solutions/solutions-hero.webp",
      width: 1280,
      height: 720,
      alt: "Business owner working through everyday business tasks at a desk",
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
        src: "/images/solutions/solutions-ai-business.webp",
        width: 1152,
        height: 864,
        alt: "Business professional using AI to help with everyday business work",
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
  trust: {
    title: "Maybe you don't need us to build anything.",
    supporting: [
      "Sometimes the best solution is already available.",
      "Sometimes a simple change in your process can solve the problem.",
      "Sometimes a small automation is enough.",
      "And sometimes you really do need a custom system.",
      "We'll help you figure out which one makes sense.",
    ] as const,
    turn: "Maybe you don't need us...",
    okay: "...and that's okay.",
    close: ["No unnecessary software.", "No technology for the sake of technology."] as const,
  },
  industries: {
    title: "Every business works differently.",
    supporting: [
      "A manufacturer doesn't work like a service company.",
      "A distributor doesn't work like a consultant.",
      "A school doesn't work like a retailer.",
      "That's why we don't start with a fixed product.",
      "We start by understanding how your business works.",
    ] as const,
    environments: [
      { id: "manufacturing", label: "Manufacturing" },
      { id: "trading", label: "Trading & Distribution" },
      { id: "services", label: "Professional Services" },
      { id: "retail", label: "Retail & Consumer" },
      { id: "education", label: "Education" },
      { id: "logistics", label: "Logistics" },
      { id: "printing", label: "Printing & Packaging", note: "Deep expertise" },
      { id: "more", label: "And more" },
    ] as const,
  },
  print: {
    title: "One industry we know especially well.",
    supporting: [
      "Our roots are in printing and packaging.",
      "Working closely with this industry led us to build tools for artwork checking, label costing, production workflows, security verification and business operations.",
      "That experience taught us something important:",
      "Every industry has its own way of working.",
      "But good problem-solving starts the same way — understand the work, find the friction, and make it simpler.",
    ] as const,
    statement: ["The industry may be specific.", "The way we solve problems isn't."] as const,
    primary: {
      name: "Flexora",
      line: "ERP and HRMS for flexographic label printing.",
      href: "/products/flexora/",
      link: "See Flexora",
      slug: "flexora",
      screen: "Flexora plant command centre, demo data",
    },
    secondary: [
      {
        name: "PrintVerify",
        line: "Artwork and separations checked before production.",
        href: "/products/printverify/",
        link: "See PrintVerify",
        slug: "printverify",
        screen: "PrintVerify vendor plate check, demo artwork",
      },
      {
        name: "CRM",
        line: "Enquiries, quotes and follow-ups in one place.",
        href: "/crm/",
        link: "See the CRM",
        slug: "crm",
        screen: "CRM enquiry pipeline, demo data",
      },
      {
        name: "Label Rate",
        line: "Roll-label costing from size, paper, ink and wastage.",
        href: "/calculators/?tab=label-rate",
        link: "Open the full calculator",
        resultLabel: "Per 1,000 labels",
      },
    ] as const,
  },
  start: {
    title: "You don't have to change everything at once.",
    lines: [
      "Start with one problem.",
      "Fix one process.",
      "Save a little time.",
      "See what happens.",
      "Then decide what comes next.",
    ] as const,
    steps: ["One problem", "One improvement", "Real result", "Next step"] as const,
    figure: {
      label: "A calm workspace. The photograph comes later.",
      src: "/images/solutions/solutions-start-small.webp",
      width: 1280,
      height: 720,
      alt: "Business owner reviewing a simple digital business tool",
    },
  },
  principles: {
    title: "We won't recommend technology just because it's new.",
    supporting: "We'll recommend it when it makes sense for your business.",
    items: [
      {
        number: "01",
        title: "Useful",
        body: ["If it doesn't solve a real problem, we don't need it."],
      },
      {
        number: "02",
        title: "Simple",
        body: ["Technology should make work easier, not harder."],
      },
      {
        number: "03",
        title: "Practical",
        body: ["Start with what matters.", "Improve as you grow."],
      },
    ] as const,
  },
  faq: {
    title: "Questions you may have.",
    supporting: "Before we talk, here are a few things worth knowing.",
    items: [
      {
        id: "custom",
        question: "Do I need custom software?",
        answer:
          "Not necessarily. Sometimes the right solution is an existing tool, a better process, a small automation, or a simple calculator. We start by understanding the problem before recommending what to build.",
      },
      {
        id: "tools",
        question: "Can you work with the tools we already use?",
        answer:
          "Yes. If your current tools are doing the job, we would rather improve the workflow around them than replace them unnecessarily.",
      },
      {
        id: "unknown",
        question: "What if I don't know what needs to be automated?",
        answer:
          "That's completely fine. You don't need to arrive with a technical solution. Tell us what takes too much time, gets repeated, or keeps causing friction. We'll help identify where technology actually makes sense.",
      },
      {
        id: "small",
        question: "Can we start with something small?",
        answer:
          "Yes. In many cases, starting with one real problem is the better approach. Solve it, learn from it, and scale when it proves useful.",
      },
      {
        id: "printing",
        question: "Do you only work with printing and packaging businesses?",
        answer:
          "No. Printing and packaging is where our deepest domain experience comes from, but the way we solve problems applies across growing businesses and teams.",
      },
      {
        id: "start",
        question: "How do we get started?",
        answer:
          "Start with a conversation about the work. Tell us what feels repetitive, unclear, slow, or difficult. We'll help you figure out what, if anything, should be improved.",
      },
    ] as const,
  },
  close: {
    title: "What's one thing in your business you wish was easier?",
    supporting: [
      "Tell us about it.",
      "You don't need to know what technology you need.",
      "That's our job to figure out.",
    ] as const,
    primary: { label: "Tell Us About Your Problem", href: "/contact/" },
    secondary: { label: "Explore Our Products", href: "/products/" },
    note: ["No pressure.", "No complicated pitch.", "Just a conversation about what could be better."] as const,
  },
} as const;

export type SolutionFragmentKind = (typeof solutions.problem.items)[number]["kind"];
