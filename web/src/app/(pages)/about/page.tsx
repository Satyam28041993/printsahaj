import type { Metadata } from "next";
import AboutCta from "@/components/about/AboutCta";
import AboutCvLists from "@/components/about/AboutCvLists";
import AboutFounder from "@/components/about/AboutFounder";
import AboutHero from "@/components/about/AboutHero";
import AboutPdfSection from "@/components/about/AboutPdfSection";
import AboutPrintDocument from "@/components/about/AboutPrintDocument";
import AboutProducts from "@/components/about/AboutProducts";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutVisitingCard from "@/components/about/AboutVisitingCard";
import { about } from "@content/about";

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-screen">
        <AboutHero />
        <AboutProducts />
        <AboutFounder />
        <AboutTimeline />
        <AboutCvLists />
        <AboutVisitingCard />
        <AboutPdfSection />
        <AboutCta />
      </div>
      <AboutPrintDocument />
    </div>
  );
}
