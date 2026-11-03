import { JsonLd, PageHero } from "@/components/ui";
import { ArticleCard } from "@/components/ArticleCard";
import { CtaBand } from "@/components/CtaBand";
import { getArticles } from "@/lib/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Insights: Accounting Careers & Hiring Advice",
  description:
    "Practical advice for Vancouver CPAs and the firms that hire them: choosing a recruiter, moving from public practice to industry, partner-track roles and more.",
  path: "/insights",
});

export default async function InsightsPage() {
  const articles = await getArticles();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Insights", path: "/insights" }])} />
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Advice from accountants <span className="font-serif italic text-gold">who recruit accountants.</span>
          </>
        }
        intro="Practical guidance for CPAs planning their next move, and for the firms hiring them."
        crumbs={[{ name: "Insights" }]}
      />
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
