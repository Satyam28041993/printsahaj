"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import NavClock from "./NavClock";
import { printSahajSite } from "@content/site";

function pathMatches(pathname: string, href: string) {
  const current = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M4 12h15m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The header: a dark capsule with a soft glow in the same inks as the hero
 * orb. It stays dark in both themes, the way a printed badge would.
 */
export default function SiteNav({
  variant = "overlay",
}: {
  variant?: "overlay" | "solid";
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = () => setMenuOpen(false);
  const { links, callCta } = printSahajSite.nav;

  return (
    <header className={`ps-header ${variant === "solid" ? "sticky" : "fixed"} inset-x-0 top-0 z-50`}>
      <div className="ps-nav-wrap">
        <nav aria-label="Primary" className="ps-nav">
          <Link href="/" className="ps-nav__brand" aria-label="PrintSahaj, home">
            <Logo size="md" instance="nav" />
          </Link>

          <span className="ps-nav__rule hidden xl:block" aria-hidden="true" />

          <ul className="ps-nav__links hidden xl:flex">
            {links.map((link) => {
              const active = pathMatches(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="ps-nav__link"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <span className="ps-nav__rule hidden lg:block" aria-hidden="true" />

          <div className="hidden lg:block">
            <NavClock />
          </div>

          <div className="ps-nav__actions">
            <ThemeToggle />
            <a href={callCta.href} className="ps-call hidden sm:inline-flex" aria-label={`${callCta.label}: ${callCta.number}`}>
              <PhoneIcon />
              <span>{callCta.label}</span>
              <ArrowIcon />
            </a>
            <a href={callCta.href} className="ps-call ps-call--icon inline-flex sm:hidden" aria-label={`${callCta.label}: ${callCta.number}`}>
              <PhoneIcon />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="ps-nav__burger inline-flex xl:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                {menuOpen ? (
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--bg-base)_72%,transparent)] backdrop-blur-[2px] xl:hidden"
          onClick={closeMenu}
        />
      ) : null}

      {/* Above the z-40 scrim: it is there to dim the page, not the menu. */}
      <div
        id="mobile-nav"
        className={`relative z-50 grid px-3 sm:px-5 xl:hidden ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-300 ease-out`}
      >
        <div className="overflow-hidden" inert={!menuOpen ? true : undefined} aria-hidden={!menuOpen}>
          <div className="ps-nav-sheet">
            <ul className="flex flex-col">
              {links.map((link) => {
                const active = pathMatches(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className="ps-nav__link ps-nav__link--sheet"                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 lg:hidden">
              <NavClock />
            </div>
            <a href={callCta.href} className="ps-call mt-4 flex w-full justify-center" onClick={closeMenu}>
              <PhoneIcon />
              <span>
                {callCta.label} · {callCta.number}
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
