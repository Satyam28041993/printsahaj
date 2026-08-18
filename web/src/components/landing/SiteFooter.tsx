import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { site } from "@content/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-sunken px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-faint">
              {site.footer.line}
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Contact
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="text-muted transition-colors hover:text-primary"
                  >
                    {site.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${site.contact.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted transition-colors hover:text-primary"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Legal
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {site.footer.legal.map((link) => (
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
          {site.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
