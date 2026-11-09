import "server-only";
import { getIndustries as getBaseIndustries } from "@/lib/wp";
import type { Industry } from "@/lib/types";

export * from "@/lib/wp";

/** Option 2 uses its own industry photography; everything else comes from the shared WordPress client. */
const IMAGES: Record<string, string> = {
  accounting: "/images/industry-accounting-finance.png",
  legal: "/images/industry-legal.png",
  "information-technology": "/images/industry-information-technology.png",
  "human-resources": "/images/industry-human-resources.png",
  engineering: "/images/team-collaboration.jpg",
};

export async function getIndustries(): Promise<Industry[]> {
  return (await getBaseIndustries()).map((i) => ({ ...i, image: IMAGES[i.slug] ?? i.image }));
}

export async function getIndustry(slug: string): Promise<Industry | undefined> {
  return (await getIndustries()).find((i) => i.slug === slug);
}
