import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Chrome for the secondary routes (calculators, verification, legal pages).
 * The landing page at `/` supplies its own scroll-aware nav and footer.
 */
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
