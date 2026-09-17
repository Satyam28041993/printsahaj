import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "About",
  description: printSahajSite.brand.positioning,
};

export default function AboutPage() {
  return (
    <PageIntro
      intent={["Business Solution", "Custom Project"]}
      title="About PrintSahaj"
      description={printSahajSite.brand.positioning}
    >
      <p className="mt-6 text-body-lg text-muted">{printSahajSite.brand.specialization}</p>
      <p className="mt-6 font-display text-title font-medium text-primary">
        {printSahajSite.brand.philosophy}
      </p>
      <div className="mt-12 border-t border-hairline pt-8">
        <h2 className="font-display text-display-md font-semibold text-primary">
          {home.founder.name}
        </h2>
        <p className="mt-2 text-sm text-muted">{home.founder.role}</p>
        <p className="mt-4 text-body-lg text-muted">{home.founder.description}</p>
      </div>
    </PageIntro>
  );
}
