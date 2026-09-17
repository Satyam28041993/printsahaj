import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { printSahajSite } from "@content/site";

export default function SiteFooter() {
  const { brand, nav, footer } = printSahajSite;

  return (
    <footer className="border-t border-hairline bg-sunken px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Link href="/" aria-label="PrintSahaj, home">
              <Logo size="md" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">{brand.positioning}</p>
            <p className="mt-2 text-sm leading-relaxed text-faint">{brand.specialization}</p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
              {footer.lines.map((line) => (
                <li
                  key={line}
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Explore
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {nav.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={nav.primaryCta.href}
                    className="text-muted transition-colors hover:text-primary"
                  >
                    {nav.primaryCta.label}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Legal
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {footer.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-hairline pt-6 text-sm text-faint">
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
