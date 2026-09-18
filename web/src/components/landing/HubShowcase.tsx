import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ShowcaseIcon from "./ShowcaseIcon";
import { showcase, type ShowcaseCard } from "@content/showcase";

function Card({ card }: { card: ShowcaseCard }) {
  return (
    <Link href={card.href} className="glow-card group block p-6">
      <span className="glow-card__icon">
        <ShowcaseIcon name={card.icon} />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold text-primary">{card.name}</h3>
      <span className="glow-card__tag mt-2">{card.tag}</span>
      <p className="mt-4 text-sm leading-relaxed text-muted">{card.description}</p>
    </Link>
  );
}

/**
 * Wires from a row of three cards into the hub (or out of it). Drawn in a
 * 300 x 60 box that stretches to the row width; each wire leaves a card's
 * centre and bends into the hub's centre.
 */
function Wires({ flip = false }: { flip?: boolean }) {
  const ends = [50, 150, 250];
  return (
    <svg
      className="hidden h-16 w-full md:block"
      viewBox="0 0 300 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      {ends.map((x) => {
        const d = `M${x} 0 V24 Q${x} 34 ${x + (150 - x) * 0.3} 34 H${150 - (150 - x) * 0.3} Q150 34 150 44 V60`;
        const path = x === 150 ? "M150 0 V60" : d;
        return (
          <g key={x}>
            <path className="hub-wire" d={path} vectorEffect="non-scaling-stroke" />
            <path className="hub-wire hub-wire--flow" d={path} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
}

export default function HubShowcase() {
  return (
    <section className="dots-section" aria-labelledby="showcase-heading">
      <div className="star-field" aria-hidden="true" />
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="showcase-heading" className="section-title text-balance text-4xl sm:text-5xl">
            {showcase.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted">{showcase.supporting}</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {showcase.products.map((card) => (
            <Card key={card.name} card={card} />
          ))}
        </div>

        <Wires />
        <div className="my-8 md:my-0">
          <div className="hub">
            <div className="hub__dust" />
            <div className="hub__core" />
            <div className="hub__ring hub__ring--3" />
            <div className="hub__ring hub__ring--1" />
            <div className="hub__ring hub__ring--2" />
            <div className="hub__mark">
              <Logo showWordmark={false} size="xl" instance="hub-mark" />
            </div>
          </div>
        </div>
        <Wires flip />

        <div className="grid gap-5 md:grid-cols-3">
          {showcase.tools.map((card) => (
            <Card key={card.name} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
