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
    <div id="book-crm-demo" className="scroll-mt-24">
    <PageIntro
      intent={["Custom Project", "Business Solution", "Product", "Digital Growth & Marketing"]}
      title={home.finalCta.heading}
      description={home.finalCta.supporting}
    >
      <p className="mt-8 text-sm leading-relaxed text-muted">
        A short note is enough: what you are trying to improve, how the work happens today, and
        whether you think the answer is software, automation, marketing, or something else.
      </p>
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {printSahajSite.contact.emailPublic && printSahajSite.contact.email ? (
          <a href={`mailto:${printSahajSite.contact.email}`} className="founder-linkedin">
            {printSahajSite.contact.email}
          </a>
        ) : null}
        {printSahajSite.contact.whatsappPublic && printSahajSite.contact.whatsappNumber ? (
          <a
            href={`https://wa.me/${printSahajSite.contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="founder-linkedin"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
      <div className="mt-10">
        <CtaButton href={printSahajSite.ctas.secondary.href} variant="ghost">
          {printSahajSite.ctas.secondary.label}
        </CtaButton>
      </div>
    </PageIntro>
    </div>
  );
}
