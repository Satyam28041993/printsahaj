"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { flexpack } from "@content/flexpack";

const LINKS = [
  { href: "/calculators/flexible/", label: "All tools" },
  ...flexpack.tools.map((tool) => ({ href: tool.href, label: tool.short })),
  { href: flexpack.rateBook.href, label: flexpack.rateBook.name },
];

const normalise = (path: string): string => (path.endsWith("/") ? path : `${path}/`);

export default function ToolNav() {
  const pathname = normalise(usePathname() ?? "");
  return (
    <nav aria-label="Flexible packaging calculators" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 border-b border-hairline pb-3 sm:w-auto sm:flex-wrap">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-[var(--pill-bg)] text-[var(--pill-fg)]" : "border border-hairline text-muted hover:border-hairline-hover hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
