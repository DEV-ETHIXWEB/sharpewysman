import { LegalPage } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accessibility Statement",
  description: "How Sharpe Wysman makes its website usable for everyone, the standard we aim for, and how to get help or another format.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return <LegalPage slug="accessibility" name="Accessibility statement" />;
}
