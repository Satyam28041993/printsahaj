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

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
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
      } inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-elevated border-b border-hairline"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link href="/" className="rounded-md shrink-0" aria-label="PrintSahaj, home">
          <Logo size="md" />
        </Link>

        <ul className="hidden items-center gap-5 xl:flex">
          {links.map((link) => {
            const active = pathMatches(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm transition-colors duration-200 hover:text-primary ${
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-muted transition-colors duration-200 hover:text-primary xl:hidden"
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
          className="border-t border-hairline bg-elevated px-5 pb-6 pt-2 xl:hidden"
        >
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
      )}
    </header>
  );
}
