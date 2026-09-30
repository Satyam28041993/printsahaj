import type { Metadata } from "next";
import { Google_Sans_Flex, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./home.css";
import "./motion.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { printSahajSite } from "@content/site";

/**
 * Google Sans Flex, a free (OFL) variable sans: one file serves every weight the
 * site uses. Display and body share it; the mono is kept for small labels.
 */
const sansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans-flex",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: printSahajSite.meta.title,
    template: "%s — PrintSahaj",
  },
  description: printSahajSite.meta.description,
  // Referenced explicitly: the small SVG and apple-touch PNG live in public/.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

/**
 * Applies the stored theme before first paint so the page never flashes the
 * wrong palette. Light is the default; only an explicit "dark" choice made
 * through the toggle switches it. Kept deliberately tiny.
 *
 * `js` is added before any storage access (blocked storage used to throw first
 * and skip it). `js-motion` gates every hide-before-reveal rule: it is set only
 * when reduced motion is off and IntersectionObserver exists, and is dropped
 * again after 4s if no reveal hook ever ran (failsafe: never leave content hidden).
 */
const themeScript = `(function(){var d=document.documentElement,c=d.classList;c.add("js");try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver"in window){c.add("js-motion");setTimeout(function(){if(!c.contains("motion-ready"))c.remove("js-motion")},4000)}}catch(e){}try{var t=localStorage.getItem("printsahaj_theme");if(t==="dark"){c.remove("light");c.add("dark");}else{c.remove("dark");c.add("light");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light h-full antialiased ${sansFlex.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans bg-base text-primary">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
