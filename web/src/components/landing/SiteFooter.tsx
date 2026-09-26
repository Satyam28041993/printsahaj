import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { printSahajSite } from "@content/site";
import { tools } from "@content/tools";

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Column({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="footer-heading">{heading}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="footer-link">
              {link.label}
              <Arrow />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One side's traces; the right side draws the same set mirrored. */
const TRACES = [
  { d: "M0 40 H130 L160 70 H205", end: [205, 70], ink: "var(--cyan)", delay: "0s" },
  { d: "M0 95 H70 L100 125 H200", end: [200, 125], ink: "var(--magenta)", delay: "0.8s" },
  { d: "M10 165 H120 L150 135 H205", end: [205, 135], ink: "var(--yellow)", delay: "1.6s" },
  { d: "M0 195 H170 L185 180", end: [185, 180], ink: "var(--accent-hover)", delay: "2.4s" },
];

function CircuitSide() {
  return (
    <g>
      {TRACES.map((trace) => (
        <g key={trace.d}>
          <path className="circuit-trace" d={trace.d} />
          <path
            className="circuit-pulse"
            d={trace.d}
            pathLength={100}
            stroke={trace.ink}
            style={{ animationDelay: trace.delay }}
          />
          <circle
            className="circuit-node"
            cx={trace.end[0]}
            cy={trace.end[1]}
            r="4"
            fill={trace.ink}
            style={{ animationDelay: trace.delay }}
          />
        </g>
      ))}
    </g>
  );
}

/**
 * The closing wordmark, drawn in SVG so it scales to the container instead of
 * to the viewport — a CSS font size tied to vw spilled past the edges on wide
 * screens and cut the last letter off.
 */
function FooterWordmark({ name }: { name: string }) {
  return (
    <svg
      className="footer-wordmark"
      viewBox="0 0 1300 215"
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="footer-wordmark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.45 }} />
          <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0.02 }} />
        </linearGradient>
      </defs>
      <CircuitSide />
      <g transform="translate(1300 0) scale(-1 1)">
        <CircuitSide />
      </g>
      <text
        x="650"
        y="160"
        textAnchor="middle"
        fontSize="170"
        textLength="860"
        lengthAdjust="spacingAndGlyphs"
        fill="url(#footer-wordmark-fill)"
        stroke="var(--accent-line)"
        strokeWidth="1.2"
      >
        {name}
      </text>
    </svg>
  );
}

export default function SiteFooter() {
  const { brand, nav, footer, ctas } = printSahajSite;
  const toolLinks = tools.items.map((item) => ({ label: item.name, href: item.href }));
  // The header now calls instead; the footer keeps the way into the project form.
  const exploreLinks = [...nav.links, ctas.primary];

  return (
    <footer className="site-footer">
      <div className="star-field star-field--far" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="footer-card p-7">
            <Link href="/" aria-label="PrintSahaj, home" className="inline-block">
              <Logo size="md" instance="footer" />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-muted">{brand.positioning}</p>
            <p className="mt-2 text-sm leading-relaxed text-faint">{brand.specialization}</p>
            <p className="mt-6 border-l-2 border-[var(--accent-line)] pl-4 font-display text-base font-semibold leading-snug text-primary">
              {brand.philosophy}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {footer.lines.map((line) => (
                <li key={line} className="glow-card__tag">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <Column heading="Tools" links={toolLinks} />
            <Column heading="Explore" links={exploreLinks} />
            <Column heading="Legal" links={footer.legal} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-faint">{footer.copyright}</p>
          <a href="#main" className="back-to-top">
            Back to top
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 13V3M4.5 6.5L8 3l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className="mt-10 pb-10">
          <FooterWordmark name={brand.name} />
        </div>
      </div>
    </footer>
  );
}
