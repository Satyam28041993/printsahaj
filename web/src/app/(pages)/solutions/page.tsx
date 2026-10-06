import type { Metadata } from "next";
import SolutionsApproach from "@/components/solutions/SolutionsApproach";
import SolutionsAreas from "@/components/solutions/SolutionsAreas";
import SolutionsClose from "@/components/solutions/SolutionsClose";
import SolutionsHero from "@/components/solutions/SolutionsHero";
import SolutionsIndustries from "@/components/solutions/SolutionsIndustries";
import SolutionsPrinciples from "@/components/solutions/SolutionsPrinciples";
import SolutionsPrint from "@/components/solutions/SolutionsPrint";
import SolutionsProblem from "@/components/solutions/SolutionsProblem";
import SolutionsStartSmall from "@/components/solutions/SolutionsStartSmall";
import SolutionsTrust from "@/components/solutions/SolutionsTrust";
import { solutions } from "@content/solutions";
import "../../solutions.css";

export const metadata: Metadata = {
  title: { absolute: `${solutions.meta.title} | PrintSahaj` },
  description: solutions.meta.description,
};

export default function SolutionsPage() {
  return (
    <>
      <SolutionsHero />
      <SolutionsProblem />
      <SolutionsApproach />
      <SolutionsAreas />
      <SolutionsTrust />
      <SolutionsIndustries />
      <SolutionsPrint />
      <SolutionsStartSmall />
      <SolutionsPrinciples />
      <SolutionsClose />
    </>
  );
}
