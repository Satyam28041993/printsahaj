import type { Metadata } from "next";
import SolutionsApproach from "@/components/solutions/SolutionsApproach";
import SolutionsAreas from "@/components/solutions/SolutionsAreas";
import SolutionsHero from "@/components/solutions/SolutionsHero";
import SolutionsProblem from "@/components/solutions/SolutionsProblem";
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
    </>
  );
}
