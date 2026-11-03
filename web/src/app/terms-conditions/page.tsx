import { LegalPage } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of the Sharpe Wysman website and services.",
  path: "/terms-conditions",
});

export default function TermsPage() {
  return <LegalPage slug="terms-conditions" name="Terms & conditions" />;
}
