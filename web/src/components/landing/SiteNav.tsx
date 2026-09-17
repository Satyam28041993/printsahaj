"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import CtaButton from "./CtaButton";
import { printSahajSite } from "@content/site";

function pathMatches(pathname: string, href: string) {
  const current = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

export default function SiteNav({
  variant = "overlay",
}: {
  variant?: "overlay" | "solid";
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const solid = variant === "solid" || scrolled;
  const closeMenu = () => setMenuOpen(false);
  const { links, primaryCta } = printSahajSite.nav;

  return (
    <header
      className={`${
        variant === "solid" ? "sticky" : "fixed"
      } inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-hairline bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-[var(--bg-base)] to-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link href="/" className="rounded-md shrink-0" aria-label="PrintSahaj, home">
          <Logo size="md" />
        </Link>

        <ul className="hidden items-center gap-6 xl:flex">
          {links.map((link) => {
            const active = pathMatches(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link text-sm transition-colors duration-200 hover:text-primary ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:block">
            <CtaButton href={primaryCta.href}>{primaryCta.label}</CtaButton>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-muted transition-colors duration-200 hover:border-accent-line hover:text-primary xl:hidden"
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

      <div
        id="mobile-nav"
        className={`grid xl:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-300 ease-out`}
      >
        <div className="overflow-hidden" inert={!menuOpen ? true : undefined} aria-hidden={!menuOpen}>
          <div className="border-t border-hairline bg-elevated px-5 pb-6 pt-2">
            <ul className="flex flex-col">
              {links.map((link) => {
                const active = pathMatches(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={`block py-3 text-base transition-colors hover:text-primary ${
                        active ? "text-primary" : "text-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 sm:hidden">
              <CtaButton
                href={primaryCta.href}
                size="lg"
                className="w-full justify-center"
                onClick={closeMenu}
              >
                {primaryCta.label}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
