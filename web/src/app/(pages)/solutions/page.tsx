import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Software, AI, automation and Digital Growth & Marketing systems built around real business problems.",
};

export default function SolutionsPage() {
  return (
    <PageIntro
      intent={["Business Solution", "Digital Growth & Marketing", "Custom Project"]}
      title="Solutions"
      description="PrintSahaj builds around the problem in front of you — software, automation, Digital Growth & Marketing, or a custom project."
    >
      <ul className="mt-10 space-y-4">
        {home.pillars.items.map((pillar) => (
          <li key={pillar.name} className="surface-card rounded-2xl p-6">
            <h2 className="font-display text-title font-semibold text-primary">{pillar.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Printing & packaging is our strongest domain expertise. It is not a limit on who we can
        build for.{" "}
        <Link href="/about" className="text-primary underline-offset-4 hover:underline">
          About PrintSahaj
        </Link>
      </p>
      <div className="mt-10">
        <CtaButton href={printSahajSite.ctas.primary.href}>
          {printSahajSite.ctas.primary.label}
        </CtaButton>
      </div>
    </PageIntro>
  );
}
