import { LegalPage } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Sharpe Wysman collects, uses and protects your personal information, including resumes and contact details.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return <LegalPage slug="privacy-policy" name="Privacy policy" />;
}
