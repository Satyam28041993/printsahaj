import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

const product = home.selectedProducts.items.find((item) => item.name === "Flexora");

export const metadata: Metadata = {
  title: "Flexora",
  description: product?.positioning ?? "ERP + HRMS platform designed for flexographic label printing workflows.",
};

export default function FlexoraProductPage() {
  return (
    <PageIntro
      intent="Product"
      title="Flexora"
      description={product?.positioning ?? ""}
    >
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
        {product?.status ?? "Building"}
      </p>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        Flexora is a PrintSahaj product still being built. This page does not list unshipped
        modules as live features.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <CtaButton href={printSahajSite.ctas.primary.href}>
          {printSahajSite.ctas.primary.label}
        </CtaButton>
        <CtaButton href="/products" variant="ghost">
          All products
        </CtaButton>
      </div>
    </PageIntro>
  );
}
