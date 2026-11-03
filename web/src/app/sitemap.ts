import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { getArticles, getCaseStudies, getIndustries, getOpenJobs } from "@/lib/wp";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, industries, articles, cases] = await Promise.all([getOpenJobs(), getIndustries(), getArticles(), getCaseStudies()]);
  const now = new Date();
  const statics: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ["/jobs", 0.9, "daily"],
    ["/employers", 0.9, "monthly"],
    ["/candidates", 0.9, "monthly"],
    ["/industries", 0.7, "monthly"],
    ["/about", 0.7, "monthly"],
    ["/team", 0.6, "monthly"],
    ["/testimonials", 0.6, "monthly"],
    ["/faq", 0.6, "monthly"],
    ["/insights", 0.7, "weekly"],
    ["/contact", 0.8, "yearly"],
    ["/privacy-policy", 0.2, "yearly"],
    ["/terms-conditions", 0.2, "yearly"],
  ];
  if (cases.length) statics.push(["/case-studies", 0.6, "monthly"]);
  return [
    ...statics.map(([p, priority, changeFrequency]) => ({ url: abs(p), lastModified: now, priority, changeFrequency })),
    ...industries.map((i) => ({ url: abs(`/industries/${i.slug}`), lastModified: now, priority: i.primary ? 0.9 : 0.6, changeFrequency: "monthly" as const })),
    ...jobs.map((j) => ({ url: abs(`/jobs/${j.slug}`), lastModified: new Date(j.datePosted), priority: 0.8, changeFrequency: "weekly" as const })),
    ...articles.map((a) => ({ url: abs(`/insights/${a.slug}`), lastModified: new Date(a.modified ?? a.date), priority: 0.6, changeFrequency: "monthly" as const })),
    ...cases.map((c) => ({ url: abs(`/case-studies/${c.slug}`), lastModified: now, priority: 0.5, changeFrequency: "yearly" as const })),
  ];
}
