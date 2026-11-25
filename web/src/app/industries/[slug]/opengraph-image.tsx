import { getIndustries } from "@/lib/wp";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Industries Sharpe Wysman recruits for";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = (await getIndustries()).find((x) => x.slug === slug);
  return ogCard({
    eyebrow: "Industries we recruit for",
    title: i ? `${i.name} recruitment in Vancouver` : "Specialist recruitment in Vancouver",
    footer: i?.tagline ?? "Since 2008 · Founded by a Chartered Accountant",
  });
}
