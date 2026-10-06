import type { Metadata } from "next";
import SolutionsHero from "@/components/solutions/SolutionsHero";
import { solutions } from "@content/solutions";
import "../../solutions.css";

export const metadata: Metadata = {
  title: { absolute: `${solutions.meta.title} | PrintSahaj` },
  description: solutions.meta.description,
};

export default function SolutionsPage() {
  return <SolutionsHero />;
}
