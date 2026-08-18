/** Section 4 — cost anchoring. Left panel is the status quo, right panel is the product. */

export interface CostLine {
  label: string;
  value: string;
}

export interface PricingContent {
  heading: string;
  current: {
    kicker: string;
    lines: CostLine[];
  };
  product: {
    name: string;
    price: string;
    bullets: string[];
    cta: { label: string; href: string };
  };
}

export const pricing: PricingContent = {
  heading: "What one missed plate costs",
  current: {
    kicker: "The current approach",
    lines: [
      { label: "Rejected label run", value: "₹2,00,000 +" },
      { label: "Plate set remade", value: "₹15,000 + 3 days" },
      { label: "Machine time lost", value: "per hour" },
      { label: "Customer confidence", value: "unquantifiable" },
    ],
  },
  product: {
    name: "PrintSahaj",
    price: "from ₹2,500 / month",
    bullets: [
      "Unlimited jobs",
      "Full audit trail",
      "Reports you can attach to the job bag",
      "Works with your existing plate vendor",
    ],
    cta: { label: "Get early access", href: "#early-access" },
  },
};
