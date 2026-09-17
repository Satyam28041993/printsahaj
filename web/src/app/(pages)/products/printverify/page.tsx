import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import CtaButton from "@/components/landing/CtaButton";
import { home } from "@content/home";
import { artworkTool } from "@content/tools";

const product = home.selectedProducts.items.find((item) => item.name === "PrintVerify");

export const metadata: Metadata = {
  title: "PrintVerify",
  description: product?.positioning ?? artworkTool.summary,
};

export default function PrintVerifyProductPage() {
  return (
    <PageIntro
      intent="Product"
      title="PrintVerify"
      description={product?.positioning ?? artworkTool.summary}
    >
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
        {product?.status ?? "Building"}
      </p>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        PrintVerify is a PrintSahaj product. The working desk and current documentation live on
        its existing tool page.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <CtaButton href="/tools/artwork-verification">Open PrintVerify</CtaButton>
        <CtaButton href="/products" variant="ghost">
          All products
        </CtaButton>
      </div>
    </PageIntro>
  );
}
