import type { Metadata } from "next";
import ToolPage from "@/components/flexpack/ToolPage";
import RateBookPanel from "@/components/flexpack/RateBookPanel";

export const metadata: Metadata = {
  title: "Rate Book",
  description: "Saare rates ek jagah. Jo yahan badloge woh chaaron calculators mein chalega aur isi browser mein save rahega.",
};

export default function Page() {
  return (
    <ToolPage title="Rate Book" lead="Saare rates ek jagah. Jo yahan badloge woh chaaron calculators mein chalega aur isi browser mein save rahega.">
      <RateBookPanel />
    </ToolPage>
  );
}
