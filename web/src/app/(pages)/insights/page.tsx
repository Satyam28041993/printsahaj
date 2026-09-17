import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "Insights",
  description: "Notes and writing from PrintSahaj will appear here when there is something worth publishing.",
};

export default function InsightsPage() {
  return (
    <PageIntro
      intent="Insight"
      title="Insights"
      description="Notes and writing from PrintSahaj will appear here when there is something worth publishing. There are no articles on this page yet."
    >
      <div className="mt-10">
        <CtaButton href={printSahajSite.ctas.primary.href}>
          {printSahajSite.ctas.primary.label}
        </CtaButton>
      </div>
    </PageIntro>
  );
}
