import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, JsonLd, PageHero } from "@/option-2/components/ui";
import { CtaBand } from "@/option-2/components/CtaBand";
import { getCaseStudies } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Case Studies: How We've Helped Firms Hire",
  description: "How Sharpe Wysman has helped CPA firms and finance teams across Greater Vancouver hire the right people.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const items = await getCaseStudies();
  // Hidden until real case studies are published in WordPress.
  if (!items.length) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Case studies", path: "/case-studies" }])} />
      <PageHero
        eyebrow="Case studies"
        title={
          <>
            How we&rsquo;ve helped businesses <span className="text-gold">like yours hire.</span>
          </>
        }
      />
      <section className="py-16 md:py-24">
        <div className="container-sw grid gap-6 md:grid-cols-2">
          {items.map((c) => (
            <article key={c.slug} className="group relative rounded-xl border border-line bg-white p-8 transition hover:border-ink md:p-10">
              <p className="eyebrow text-maroon">{c.industry}</p>
              <h2 className="mt-3 text-3xl group-hover:text-maroon">
                <Link href={`/case-studies/${c.slug}`} className="after:absolute after:inset-0">
                  {c.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted">{c.summary}</p>
              <p className="link-arrow mt-6">
                Read the case study <Arrow />
              </p>
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
