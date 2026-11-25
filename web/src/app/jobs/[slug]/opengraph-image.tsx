import { getJobs } from "@/lib/wp";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Open role at Sharpe Wysman";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = (await getJobs()).find((j) => j.slug === slug);
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  const salary = job?.salaryMin ? (job.salaryMax && job.salaryMax !== job.salaryMin ? `${k(job.salaryMin)} to ${k(job.salaryMax)}` : k(job.salaryMin)) : "";
  return ogCard({
    eyebrow: "Now hiring · Vancouver",
    title: job?.title ?? "Open accounting and finance roles",
    footer: [job?.location, salary].filter(Boolean).join(" · ") || "Accounting & finance recruiters",
  });
}
