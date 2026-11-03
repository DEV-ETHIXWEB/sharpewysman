import Link from "next/link";
import { Arrow, JsonLd, PageHero, SectionHeading } from "@/components/ui";
import { IndustryGrid } from "@/components/IndustryGrid";
import { CtaBand } from "@/components/CtaBand";
import { getIndustries, getOpenJobs } from "@/lib/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Industries We Recruit For in Vancouver",
  description:
    "Specialist recruitment for accounting and finance in Vancouver, plus legal, information technology, human resources and engineering hires.",
  path: "/industries",
});

export default async function IndustriesPage() {
  const [industries, jobs] = await Promise.all([getIndustries(), getOpenJobs()]);
  const openByIndustry = jobs.reduce<Record<string, number>>((acc, j) => ({ ...acc, [j.industry]: (acc[j.industry] ?? 0) + 1 }), {});
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Industries", path: "/industries" }])} />
      <PageHero
        eyebrow="Industries we serve"
        title={
          <>
            Deep in accounting. <span className="font-serif italic text-gold">Trusted beyond it.</span>
          </>
        }
        intro="We specialize in mid-level to leadership positions in accounting and finance, in public practice and industry, and we recruit for the specialist teams that work alongside them."
        crumbs={[{ name: "Industries" }]}
      />
      <section className="py-16 md:py-24">
        <div className="container-sw">
          <IndustryGrid industries={industries} openByIndustry={openByIndustry} />
        </div>
      </section>
      <section className="border-t border-line bg-white py-16 md:py-24">
        <div className="container-sw">
          <SectionHeading eyebrow="At a glance" title="Roles we recruit for" />
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((i, n) => (
              <div key={i.slug} data-reveal style={{ ["--i" as string]: n % 3 }}>
                <h3 className="border-b border-ink pb-3 text-2xl">
                  <Link href={`/industries/${i.slug}`} className="flex items-center justify-between hover:text-maroon">
                    {i.name} <Arrow />
                  </Link>
                </h3>
                <ul className="mt-4 space-y-2 text-muted">
                  {i.roles.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
