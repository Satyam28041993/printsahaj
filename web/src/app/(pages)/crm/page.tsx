import type { Metadata } from "next";
import CrmHero from "@/components/crm/CrmHero";
import { crmHero } from "@content/crm";

export const metadata: Metadata = {
  title: "CRM",
  description: crmHero.standfirst,
};

export default function CrmPage() {
  return <CrmHero />;
}
