# Homepage — next section planning ("What we've built")

Status: **PARKED** (27 Sep 2026). Planning done, build not started.

**Resume trigger:** when Satyam says "agla container ka planning pe baat karte hai",
continue from this file. First step: get answers to *Open questions* below, then design and build.

Living copy of this plan (Claude Doc): https://claude.ai/code/artifact/e661addf-0127-4760-aba4-17e2c88e3791

Branch: `claude/hopeful-carson-8g2104`. Hero orb = commit `39d1c3b`; header + help section = `4bc2e97`.

## Homepage so far (approved)

1. **Header** — dark capsule, logo, links, live date-time, Call Now (`tel:+919650744197`).
2. **Hero** — left: ecosystem image as a wavy-edged floating orb (`HeroOrb.tsx`); right: headline, Start a Project, See the CRM.
3. **Where we can help you** (`HelpScroll.tsx`) — 5 service cards one at a time: Website Building, Customized CRM, ERP, Automation Tools, Marketing & Lead Generation, then free consultation card.

Old sections below (PrintVerify, LiveTool, HubShowcase, Pillars, CaseStudy, Founder, FAQ, Final CTA) — decide later.
CRM window is no longer in the hero. "ERP" appears in the orb image and help cards — mark "being built" if not live.

## Next section: What we've built

Proof section after the help section. One showcase, one product per screen.

- Desktop: list on the left (Websites, CRMs, Aivy, calculator), large device frame on the right.
  Click to switch; auto-advance every 8–10 s.
- Mobile: frame on top, swipe tabs below.

| Product | Media | Frame |
|---|---|---|
| Websites | Full-page screenshot auto-scrolling inside the frame (not a slideshow) | Laptop / browser |
| CRMs | 10–15 s muted looping video: enquiry → quote → follow-up | Browser |
| Aivy | Chat demo or typing animation, 3–4 messages | Phone |
| PGPL calculator | Size in → rate + PDF, short video or live demo | Browser |

Rules: each video < 2–3 MB; sample data only (no client names, numbers, rates);
honest badges (Live / In use / Building); a CTA per product (`/crm/`, `/contact/#book-crm-demo`).

## PGPL Label Rate Calculator (repo `pgpl_website`, `includes/LabelRateEngine.php`)

Strongest USP: works out the rate the way a flexo printer does, not by scaling area.

- Tries 19 cylinder sizes (66–180 teeth, 3.175 mm/tooth) × ups across/around; picks the cheapest valid option by gap limits, web width, quantity.
- Costs: 11 materials, finishes (Gloss, Matt, Lamination, Spot UV), foiling, drip-off, embossing, colour-based wastage, conversion (min ₹7,000), plate, punch, transport.
- Pricing is formula only, never AI ("Do NOT put pricing logic in AI").
- **Public (no login):** instant rate, best + alternative cylinders, GST 18%, PDF quotation, Request a Callback; every public calculation saved as type "Public" (a lead).
- **Employee:** Auto / Manual / Smart Bulk calculators; Smart Bulk 5-step wizard with materials × quantities matrix (Pivot/Detail); AI (Gemini) fills fields from a plain-language job description, engine still prices; PWA install; manual quotations with number/status/client; admin dashboard filters; roles Employee/Admin/Director.
- Also on the site: PG TrueSeal (QR/pattern authenticity check), PGPL Virtual Printing Consultant (AI), QR generator, 10+ label category pages.

USP lines:
1. "Rate usi tarah nikalta hai jaise ek flexo printer khud nikaalta hai: cylinder, ups, gap, wastage."
2. "Customer ko second mein rate aur PDF quotation. Printer ko har enquiry ek saved lead."
3. "AI sirf job samajhta hai, price formula nikalta hai. Isliye har baar same rate."
4. "Ek click mein kai materials × kai quantities ka rate table."

Market check (search results; sites were blocked from the container): Labelwala scales by area (40×20 mm ref, ±10%);
LabelEstimate is a printer's tool, not a printer site; label.co.uk / All About Labels don't choose cylinder/ups.
No Indian printer site found doing all of this — but do not claim "only in India"; show the feature instead.

## CRMs (Flutter + Firebase, Android + Web)

| CRM | For | Features |
|---|---|---|
| LeadTrack CRM | TradeIndia leads (company to confirm) | Direct Inquiries + Buy Leads auto sync, Hot/Warm/Cold, follow-ups, customers/orders, analytics, CSV export, duplicate merge, multi-company |
| ATS Lead Tracker | Applied Techno Systems (ATEPL) | Leads, follow-up reminders, duplicate check, product catalogue, quotation PDF with stamp + signature, admin/employee dashboards, daily backup |
| Pactech Nexus | Pactech Machinery LLP (pactech-nexus.web.app) | TradeIndia + IndiaMART leads, category kanban, visits, follow-ups, machine quotation workspace (tamper-evident PDF), stock/ERP (GRN, vendor PO, raw material, production orders, dispatch, ledger) |

ATS Lead Tracker and Pactech Nexus share one codebase (package `atsleadtracker`).

**Product Catalogue — what other CRMs don't give** (Satyam's point, confirmed in code):
- Stored once: name, make, model, HSN, spec, accessories, base price, image, overview, key features; Nexus "Machine Master" adds drive type, speed, MOC, PLC, HMI, conveyor length, modules, scope of supply, paragraphs, images, advantages, quotation code.
- Lead entry: type a name → catalogue autocomplete, model fills itself; multi-product per lead; Quick Add Lead and Tender.
- Quotation: pick the machine → specs, features, scope, images, machine code flow into the document; PDF with letterhead, stamp, signature.
- Product-wise leads in analytics. (LeadTrack's "catalogue" is only the TradeIndia buy-leads list.)

USP lines:
1. "Off-the-shelf CRM nahi. Aapke kaam ke hisaab se bana: lead → visit → quotation → stock → dispatch."
2. "Product ka naam aur spec yaad rakhne ki zarurat nahi. Catalogue mein ek baar daalo, lead se quotation tak apne aap aata hai."
3. "Naya salesperson bhi pehle din se sahi model, sahi spec, sahi price ke saath quotation bhejta hai."
4. "TradeIndia aur IndiaMART ki har lead khud CRM mein, koi copy-paste nahi."

Market: TrackOlap, SalesTub, LMSBaba, Zoho IndiaMART plugin bring leads in but are general CRMs.

## Aivy — personal AI assistant (repo `Aivy`)

- Live and tested: voice/chat reminders with phone alarm and push; morning brief (tasks, projects, today, mail, Hindi news, Google Alerts, one summary line); birthdays/anniversaries 15/10/5/1 days ahead; saved places, Maps, live location; Google Calendar/Gmail/Sheets/Contacts (Android).
- Built, not yet used by Satyam: Projects and Tasks from one sentence, with reminders, check-ins and history.
- USP: "Ek aadmi ka apna notebook. Hinglish mein bolo, woh kaam, deadline aur reminder khud bana deta hai, aur subah sab ek line mein bata deta hai."
- Mismatch: PGPL `aivy.html` calls Aivy a "WhatsApp Business Communication Platform"; repo calls it a personal assistant. Pick one.

## Client websites

| Site | Business | Notes |
|---|---|---|
| pgpltechprint.com | Label printing (PGPL) | Calculator, employee portal, TrueSeal, AI consultant, PWA |
| propackind.in | Flexible packaging | Next.js 16, Three.js hero, GSAP, smooth scroll |
| tricil.in | BOPP films, cartons, pouches | 15-page static HTML, machinery + certificates |
| ashokrajindustries.com | Perforated metal, cable trays | Next.js 15, industries, blogs, gallery |

USP: "Sirf sundar site nahi. Printing aur packaging ko samajh ke bani site, jisme calculator, lead capture aur admin bhi ho sakta hai."

## Open questions (ask before building)

- [ ] Permission to show PGPL, Propack, Tricil, Ashokraj, ATEPL, Pactech names and screenshots publicly?
- [ ] Show real PGPL ₹/sqm rates in media, or blur?
- [ ] Aivy: personal tool or future product? What about the PGPL WhatsApp-platform positioning?
- [ ] LeadTrack CRM: which company uses it (deployed at `pgpl_website/leadtrackcrm` — PGPL?)
- [ ] ERP: live or being built?
- [ ] Who provides recordings / full-page screenshots, or should we write recording instructions?
