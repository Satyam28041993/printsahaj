import type { Metadata } from "next";
import ToolPage from "@/components/flexpack/ToolPage";
import PouchCostTool from "@/components/flexpack/PouchCostTool";

export const metadata: Metadata = {
  title: "Pouch Cost Calculator",
  description: "3-side seal, center seal ya standy pouch ka cost — film, conversion, cylinder, zipper, packing aur profit ke saath. First order aur repeat order alag, GST alag.",
};

export default function Page() {
  return (
    <ToolPage title="Pouch Cost Calculator" lead="3-side seal, center seal ya standy pouch ka cost — film, conversion, cylinder, zipper, packing aur profit ke saath. First order aur repeat order alag, GST alag.">
      <PouchCostTool />
    </ToolPage>
  );
}
