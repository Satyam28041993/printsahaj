import type { Metadata } from "next";
import ToolPage from "@/components/flexpack/ToolPage";
import StructureTool from "@/components/flexpack/StructureTool";

export const metadata: Metadata = {
  title: "Structure / GSM / Yield Calculator",
  description: "Laminate ko layer by layer banao. GSM = micron × density, paper mill GSM mein, aur sirf dry ink / adhesive. Result: total GSM, m²/kg, ₹/m² aur ₹/kg.",
};

export default function Page() {
  return (
    <ToolPage title="Structure / GSM / Yield Calculator" lead="Laminate ko layer by layer banao. GSM = micron × density, paper mill GSM mein, aur sirf dry ink / adhesive. Result: total GSM, m²/kg, ₹/m² aur ₹/kg.">
      <StructureTool />
    </ToolPage>
  );
}
