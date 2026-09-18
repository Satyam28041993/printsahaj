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

export default function SiteFooter() {
  const { brand, nav, footer } = printSahajSite;
  const toolLinks = tools.items.map((item) => ({ label: item.name, href: item.href }));
  const exploreLinks = [...nav.links, nav.primaryCta];

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

        <p className="footer-wordmark mt-10" aria-hidden="true">
          {brand.name}
        </p>
      </div>
    </footer>
  );
}
