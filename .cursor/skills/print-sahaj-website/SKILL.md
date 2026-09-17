---
name: print-sahaj-website
description: PrintSahaj marketing website architecture, reusable components, logo treatment, visual system, and what not to rewrite. Use when editing web/, homepage, header, footer, Next.js routes, or when the user asks to redesign the site.
---

# PrintSahaj website

## Stack

`web/` — Next.js App Router, static export, Tailwind v4 tokens in `src/app/globals.css`, GSAP reveals, Framer Motion only where already used. Copy lives in `web/content/*.ts`.

Read `node_modules/next/dist/docs/` from `web/` before using Next APIs. Do not add frameworks or animation libraries without asking.

## Reuse vs redesign

**Keep / reuse**

- Token system and dark default in `globals.css`
- `Logo.tsx` (inline CMYK SVG — do not replace with an uncropped white PNG)
- `CtaButton`, `Section`, `useReveal`, `SiteNav` structure
- PrintVerify page + `web/content/tools.ts`
- Hostinger FTP + Firebase hosting config

**Redesign (when approved)**

- Homepage sections (currently PrintVerify-only)
- `site.ts` nav, meta, footer; do not expose WhatsApp placeholder `919876543210` or an unconfirmed email
- Dual chrome: landing `SiteNav` vs inner `Navbar` (glass, PrintVerify CTA)
- Header logo size (`size="sm"` = 30px)

## Content model

Do not put the same copy in multiple components. Create these files only when implementation is approved:

```
web/content/
  site.ts       brand metadata, nav, page-intent labels, global CTAs, footer, contact config, SEO defaults
  home.ts       homepage sections only (hero through final CTA)
  products.ts
  solutions.ts
  work.ts
  tools.ts      keep existing PrintVerify artworkTool copy
  insights.ts
```

`home.ts` covers: hero, what is PrintSahaj, four pillars, selected products, Digital Growth & Marketing, printing & packaging specialization, selected work references, founder, optional currently-building, final CTA.

## Logo

Assets: `web/public/assets/MainLogo.png` (2816×1536, white canvas), icon-only, vertical lockup, monochrome. Favicon already uses the icon PNG. For dark UI, enlarge the SVG mark (md/lg) and crop/export a transparent lockup later. Never stretch.

## Target routes

This is not a one-page website. Homepage overviews link to real URLs. Do not use hash sections as the only home for a destination.

Every page must answer whether the visitor is looking for a product, a business solution, a marketing/growth solution, a tool, or a custom project.

Preferred map (create when implementation is approved): `/` `/products` `/products/printverify` `/products/flexora` `/solutions` `/tools` `/work` `/insights` `/about` `/contact`.

Keep `/tools/artwork-verification` working until a deliberate PrintVerify URL move is approved.

Primary CTA: Start a Project.

Footer/company chrome: Technology, AI, Automation, Digital Growth & Marketing, business systems, digital solutions, printing & packaging expertise. Never "verification system for India's printing and packaging industry" for PrintSahaj.

## Quality

Skip link, real headings, reduced motion, mobile + desktop check in the browser after UI changes.
