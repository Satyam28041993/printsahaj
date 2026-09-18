import SiteNav from "@/components/landing/SiteNav";
import ScrollProgress from "@/components/landing/ScrollProgress";
import HomeHero from "@/components/landing/HomeHero";
import WhatIsPrintSahaj from "@/components/landing/WhatIsPrintSahaj";
import Pillars from "@/components/landing/Pillars";
import HubShowcase from "@/components/landing/HubShowcase";
import ResultsPanel from "@/components/landing/ResultsPanel";
import CaseStudy from "@/components/landing/CaseStudy";
import DigitalGrowth from "@/components/landing/DigitalGrowth";
import Specialization from "@/components/landing/Specialization";
import SelectedWork from "@/components/landing/SelectedWork";
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
        <Pillars />
        <HubShowcase />
        <ResultsPanel />
        <CaseStudy />
        <DigitalGrowth />
        <Specialization />
        <SelectedWork />
        <Founder />
        <FaqSection />
        <HomeFinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
