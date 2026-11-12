import type { Metadata } from "next";
import ToolPage from "@/components/flexpack/ToolPage";
import InkTool from "@/components/flexpack/InkTool";

export const metadata: Metadata = {
  title: "Ink & Adhesive Consumption",
  description: "Physically correct mass: dry kg = area × coverage × dry GSM ÷ 1000, aur wet kg = dry ÷ solids. Excel wala GSM × ₹/kg shortcut default nahi hai.",
};

export default function Page() {
  return (
    <ToolPage title="Ink & Adhesive Consumption" lead="Physically correct mass: dry kg = area × coverage × dry GSM ÷ 1000, aur wet kg = dry ÷ solids. Excel wala GSM × ₹/kg shortcut default nahi hai.">
      <InkTool />
    </ToolPage>
  );
}
