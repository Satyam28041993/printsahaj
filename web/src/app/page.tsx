import SiteNav from "@/components/landing/SiteNav";
import ScrollProgress from "@/components/landing/ScrollProgress";
import HomeHero from "@/components/landing/HomeHero";
import WhatIsPrintSahaj from "@/components/landing/WhatIsPrintSahaj";
import BuildJourney from "@/components/landing/BuildJourney";
import Pillars from "@/components/landing/Pillars";
import TraceIdentity from "@/components/landing/TraceIdentity";
import HubShowcase from "@/components/landing/HubShowcase";
import ProductProof from "@/components/landing/ProductProof";
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
        <WhatIsPrintSahaj />
        <BuildJourney />
        <Pillars />
        <TraceIdentity />
        <HubShowcase />
        <ProductProof />
        <CaseStudy />
        <Founder />
        <FaqSection />
        <HomeFinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
