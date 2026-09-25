import SiteNav from "@/components/landing/SiteNav";
import ScrollProgress from "@/components/landing/ScrollProgress";
import HomeHero from "@/components/landing/HomeHero";
import CrmShowcase from "@/components/landing/CrmShowcase";
import ProductChapters from "@/components/landing/ProductChapters";
import LiveTool from "@/components/landing/LiveTool";
import Pillars from "@/components/landing/Pillars";
import HubShowcase from "@/components/landing/HubShowcase";
import CaseStudy from "@/components/landing/CaseStudy";
import Founder from "@/components/landing/Founder";
import FaqSection from "@/components/landing/FaqSection";
import HomeFinalCta from "@/components/landing/HomeFinalCta";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <SiteNav variant="overlay" />
      <main id="main">
        <HomeHero />
        <CrmShowcase />
        <ProductChapters />
        <LiveTool />
        <HubShowcase />
        <Pillars />
        <CaseStudy />
        <Founder />
        <FaqSection />
        <HomeFinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
