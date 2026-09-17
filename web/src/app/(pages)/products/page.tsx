import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "Products",
  description: home.selectedProducts.supporting,
};

export default function ProductsPage() {
  return (
    <PageIntro
      intent="Product"
      title="Products"
      description={home.selectedProducts.supporting}
    >
      <ul className="mt-10 space-y-4">
        {home.selectedProducts.items.map((product) => (
          <li key={product.name}>
            <Link
              href={product.href}
              className="surface-card block rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-title font-semibold text-primary">
                  {product.name}
                </h2>
                <span className="rounded-full border border-accent-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  {product.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.positioning}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <CtaButton href={printSahajSite.ctas.primary.href}>
          {printSahajSite.ctas.primary.label}
        </CtaButton>
      </div>
    </PageIntro>
  );
}
