import Link from "next/link";
import { Arrow, JsonLd, PageHero } from "@/components/ui";
import { ArticleCard } from "@/components/ArticleCard";
import { CtaBand } from "@/components/CtaBand";
import { getArticles, getOpenJobs } from "@/lib/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Insights: Accounting Careers & Hiring Advice",
  description:
    "Practical advice for Vancouver CPAs and the firms that hire them: choosing a recruiter, moving from public practice to industry, partner-track roles and more.",
  path: "/insights",
});

export default async function InsightsPage() {
  const [articles, jobs] = await Promise.all([getArticles(), getOpenJobs()]);
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Insights", path: "/insights" }])} />
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Advice from accountants <span className="text-gold">who recruit accountants.</span>
          </>
        }
        intro="Practical guidance for CPAs planning their next move, and for the firms hiring them."
        image="/images/professional-downtown.jpg"
        caption="Advice worth pulling up a chair for."
      >
        <Link href="/jobs" className="btn btn-gold">
          Browse {jobs.length} open roles <Arrow />
        </Link>
        <Link href="/contact" className="btn btn-ghost-light">
          Talk to a recruiter
        </Link>
      </PageHero>
      <section className="py-16 md:py-24">
        <div className="container-sw grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
