import React from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Boxes, LayoutDashboard, TrendingUp } from "lucide-react";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

/** One icon per pillar, in the order of home.pillars.items. */
const ICONS = [LayoutDashboard, Bot, TrendingUp, Boxes];

/** "What we build": four cards, each with an icon, a plain benefit line, three chips and a link. */
export default function Pillars() {
  const { items } = home.pillars;

  return (
    <section aria-labelledby="pillars-heading" className="band-sunken relative px-5 py-[clamp(64px,8vw,104px)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p data-m="reveal" className="max-w-xl font-display text-title text-primary">
          {printSahajSite.brand.philosophy}
        </p>
        <h2 id="pillars-heading" data-m="lines" className="mt-8 font-display text-display-md font-semibold text-primary">
          {home.pillars.heading}
        </h2>
        <ul data-m="reveal" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? Boxes;
            return (
              <li key={item.name} data-m-child className="pcard">
                <Link href={item.card?.href ?? "/solutions/"} className="pcard__link" aria-label={`${item.name}: learn more`}>
                  <span className="pcard__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3 className="pcard__title">{item.name}</h3>
                  <p className="pcard__benefit">{item.card?.benefit ?? item.description}</p>
                  {item.card ? (
                    <ul className="pcard__chips" aria-label={`${item.name}: topics`}>
                      {item.card.chips.map((chip) => (
                        <li key={chip}>{chip}</li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="pcard__go" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
