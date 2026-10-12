import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./prisha.css";

/**
 * Prisha's Learning Hub — a family page, not part of the PrintSahaj site.
 * No site nav/footer, not linked from anywhere, and kept out of search
 * engines (this meta tag plus an X-Robots-Tag header in public/.htaccess).
 * It is NOT private: anyone with the link can open it. For family-only
 * access, password-protect the folder in Hostinger (see docs/prisha-learning-hub.md).
 */
export const metadata: Metadata = {
  title: { absolute: "Prisha's Learning Hub" },
  description: "Practice worksheets for Prisha.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffd84d",
};

/** Baloo 2: round, friendly, and covers Devanagari, so Marathi letters render properly. */
const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: "variable",
  variable: "--font-ph",
  display: "swap",
});

export default function PrishaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`ph-root ${baloo.variable}`}>{children}</div>;
}
