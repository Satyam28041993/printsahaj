import { redirect } from "next/navigation";

/** Old address. The tool is listed under Tools, not as the website itself. */
export default function VerificationRedirectPage() {
  redirect("/tools/artwork-verification");
}
