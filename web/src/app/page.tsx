import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Checks from "@/components/landing/Checks";
import Pricing from "@/components/landing/Pricing";
import Limits from "@/components/landing/Limits";
import Audience from "@/components/landing/Audience";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <Problem />
        <Checks />
        <Pricing />
        <Limits />
        <Audience />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
