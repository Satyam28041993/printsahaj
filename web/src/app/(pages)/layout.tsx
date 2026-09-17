import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";

/**
 * Chrome for inner routes. Matches the company homepage language (tokens,
 * Logo SVG, CtaButton) rather than the older glass PrintVerify nav.
 */
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav variant="solid" />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
