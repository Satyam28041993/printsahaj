import type { Metadata } from "next";
import ToolPage from "@/components/flexpack/ToolPage";
import CylinderTool from "@/components/flexpack/CylinderTool";

export const metadata: Metadata = {
  title: "Cylinder / Plate Cost Spread",
  description: "Gravure cylinder ya flexo plate ka kharcha, aur woh first order ke har pouch par kitna padta hai. Repeat order par tooling nahi lagti.",
};

export default function Page() {
  return (
    <ToolPage title="Cylinder / Plate Cost Spread" lead="Gravure cylinder ya flexo plate ka kharcha, aur woh first order ke har pouch par kitna padta hai. Repeat order par tooling nahi lagti.">
      <CylinderTool />
    </ToolPage>
  );
}
