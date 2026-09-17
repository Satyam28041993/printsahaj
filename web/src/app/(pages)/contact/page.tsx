import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "Start a Project",
  description: home.finalCta.supporting,
};

export default function ContactPage() {
  return (
    <PageIntro
      intent={["Custom Project", "Business Solution", "Product", "Digital Growth & Marketing"]}
      title={home.finalCta.heading}
      description={home.finalCta.supporting}
    >
      <p className="mt-8 text-sm leading-relaxed text-muted">
        A short note is enough: what you are trying to improve, how the work happens today, and
        whether you think the answer is software, automation, marketing, or something else.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-faint">
        A confirmed public email and WhatsApp number are not listed here yet.
      </p>
      <div className="mt-10">
        <CtaButton href={printSahajSite.ctas.secondary.href} variant="ghost">
          {printSahajSite.ctas.secondary.label}
        </CtaButton>
      </div>
    </PageIntro>
  );
}
