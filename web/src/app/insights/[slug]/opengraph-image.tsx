import { getArticles } from "@/lib/wp";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Sharpe Wysman insights";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = (await getArticles()).find((x) => x.slug === slug);
  return ogCard({
    eyebrow: `Insights · ${a?.category ?? "Hiring in Vancouver"}`,
    title: a?.title ?? "Insights from Vancouver's accounting recruiters",
    footer: "Written by accounting and finance recruiters",
  });
}
