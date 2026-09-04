# Go to market — selling, distribution, data, scale, pricing

Working notes from the planning discussion on 4 September 2026.

**Caveat that applies to this entire document:** all of it is contingent on
Phase 0 clearing its decision gate. If 20 historical jobs do not surface real
errors, there is nothing here worth executing.

---

## 1. How it gets sold

This is not a self-serve product. No label printer searches for "artwork
verification software". The landing page is useful for capturing interest; the
sale does not happen there.

**The sale happens one way: run their own past job in front of them.**

> "Give me one job that went wrong. Or any ten old jobs."

Then show what comes back. Nothing else will convince this audience, and nothing
else needs to.

**The unfair advantage:** we are a printer. Not a software vendor explaining an
industry back to the people who work in it. PGPL's name already carries in the
Vasai–Mumbai label cluster.

### Channels, in priority order

| Channel | Realistic contribution |
|---|---|
| Own network — Vasai/Mumbai cluster | The first five to ten customers |
| Referral from a satisfied customer | Strongest channel in this trade |
| Industry association (LMAI and similar) | Credibility, one chance to be heard |
| Trade shows (Labelexpo India, PrintPack) | Expensive; perhaps 20–30 serious leads |
| Plate vendors as a channel | Treat with caution — the tool audits them |

**First five customers are design partners.** Cheap or free for six months, in
exchange for their historical jobs (which is the parser's raw material) and
permission to use their name. This is not lost revenue; it is the input the
product cannot be built without.

---

## 2. Distribution

Two separate questions: how the software reaches them, and where the processing
happens.

**Reaching them** is straightforward:

- Pre-press desk — web application, nothing to install. Updates are pushed once
  and everyone has them
- Press floor — Android app, Phase 3, sideload or an internal Play Store track
- Rule packs are fetched from the server. A regulation changes, a new pack is
  published, everyone has it immediately, with no app update

**Where processing happens** is the real question, and the spec contains a
tension: §9.3 describes multi-tenant SaaS, while §9.5 says printers will not
upload customer artwork to a system they do not trust and will ask for
on-premise deployment.

**Position for the first ten customers: cloud, single deployment.**

Ten separate on-premise installations means ten versions, ten support
relationships, and every fix deployed ten times. A small team does not survive
that. On-premise is built when a customer is paying enterprise money and asking
for it specifically.

The answer to the trust objection is not on-premise. It is retention — below.

---

## 3. Data management

The insight that makes this tractable:

> **The artwork does not need to be kept.**

Once a job is processed, what is needed is the file **hash** (for version lock),
the **extracted structured data** (colour list, geometry, text map), and the
**report**. The source PDF can be deleted after 30 days.

That solves three problems at once:

- **Trust** — "your customer's artwork is deleted after 30 days; we keep the
  report and the fingerprint." More convincing than an on-premise install, and
  far cheaper to operate
- **Storage** — a steady state of a few gigabytes instead of a pile that only
  grows
- **Liability** — what is not held cannot leak

### Non-negotiables (spec §9.5)

- **Tenant is the printer company.** Users, customers, jobs, colour mappings,
  dictionaries and reports are all scoped to it
- **Strict isolation.** These printers compete with each other; one leak ends
  the business. Client-side security rules are not sufficient — enforce the
  tenant check server-side as well
- **Per-tenant encryption at rest**
- **Audit log** — who viewed what, and when
- **No cross-tenant analytics or training on artwork content. Ever.**
- **Backups** of reports and job records. Not of artwork, which is being
  deleted by design

### Signup model

The company registers, not the individual. The first person becomes that
company's administrator and invites their team; each member gets a role
(pre-press, QC, press operator, manager, admin) that decides what they can see.
An invite belongs to one company, so nobody can reach another company's data.

**Keep signup manually activated at first.** Let people fill the form, but
activate accounts by hand after a phone call. Two reasons: every printer's
colour naming differs and needs setting up once, and talking to the first ten
customers is the single most valuable thing available at that stage.

---

## 4. Scale

**The servers are not the constraint.** At ten printers and roughly 30 jobs each
per month:

| | At 10 printers |
|---|---|
| Compute | A few CPU-hours per month |
| Storage (30-day retention) | Single-digit gigabytes, steady |
| Infrastructure cost | Small, relative to revenue |
| Revenue at ~₹4,000 average | ₹40,000/month |

The constraints are human, in three places:

1. **Every plate vendor's PDF is different.** Ten printers may mean fifteen to
   twenty vendors. **A vendor profile must be a configuration file, not Python
   code** — a new vendor should mean writing config, not shipping a release
2. **Onboarding.** Colour mapping tables, custom dictionaries, rule pack
   selection. If each one is done by hand, growth stops around twenty
   customers. The spec already has the right pattern (§4.2 B): an unmapped name
   is asked once and remembered. Apply it everywhere
3. **Rule packs go stale.** Regulations change. Every pack shows its
   last-verified date, and review is a recurring commitment — which is also
   something that can eventually be charged for

---

## 5. Pricing

**Inconsistency to resolve:** the spec (§11) says Starter is ₹1,500–2,500, while
the landing page says "from ₹2,500/month". These must agree.

**Also outstanding (spec §14):** pricing has not been validated with five
printers, which was the stated prerequisite for publishing tiers.

### Proposed

| Tier | For | Rate |
|---|---|---|
| Starter | 1–2 users, Steps 1 and 2, ~50 jobs/month | ₹2,500/mo |
| Standard | Full team, all three steps, audit trail, reports | ₹5,000/mo |
| Pro | Unlimited users, customer portal, custom rule packs, API | ₹12,000/mo |
| Enterprise | On-premise, integrations, SLA | Custom |

### Adjustments to the spec's model

- **No per-seat pricing on the lower tiers.** They will share a login regardless.
  Price per company, tier by job volume and features
- **Annual upfront: two months free.** Cash flow matters in this trade, and it
  matters on our side too
- **Design partners at ₹1,000/month or free**, in exchange for jobs and a
  testimonial

### The anchor

We are not selling ₹5,000 of software. We are preventing a ₹2,00,000 reject.

Never justify the price against a feature list. Always against the cost of one
missed plate. That is why the comparison block exists on the landing page.
