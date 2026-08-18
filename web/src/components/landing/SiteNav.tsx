"use client";

import React, { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import CtaButton from "./CtaButton";
import { site } from "@content/site";

/**
 * Transparent over the hero, then solid with a hairline once the hero is behind
 * us. Uses a scroll listener rather than ScrollTrigger so the nav is correct
 * even before GSAP has loaded.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-elevated border-b border-hairline"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <a href="#top" className="rounded-md" aria-label="PrintSahaj, home">
          <Logo size="sm" />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <CtaButton href={site.nav.cta.href} className="hidden sm:inline-flex">
            {site.nav.cta.label}
          </CtaButton>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors duration-200 hover:text-primary md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5h11M2.5 11h11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-hairline bg-elevated px-5 pb-6 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {site.nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-base text-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <CtaButton
            href={site.nav.cta.href}
            size="lg"
            className="mt-3 w-full justify-center sm:hidden"
          >
            {site.nav.cta.label}
          </CtaButton>
        </div>
      )}
    </header>
  );
}
