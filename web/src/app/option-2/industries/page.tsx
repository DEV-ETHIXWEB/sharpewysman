import Link from "next/link";
import { Arrow, JsonLd, PageHero, SectionHeading } from "@/option-2/components/ui";
import { IndustryGrid } from "@/option-2/components/IndustryGrid";
import { RoleCategoryCards } from "@/option-2/components/RoleCategoryCards";
import { CtaBand } from "@/option-2/components/CtaBand";
import { getIndustries, getOpenJobs } from "@/option-2/wp";
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
            Deep in accounting. <span className="text-gold">Trusted beyond it.</span>
          </>
        }
        intro="We specialize in mid-level to leadership positions in accounting and finance, in public practice and industry, and we recruit for the specialist teams that work alongside them."
        image="/images/industry-accounting-finance.png"
        caption="Five fields, one standard of care."
      >
        <Link href="/jobs" className="btn btn-gold">
          Browse {jobs.length} open roles <Arrow />
        </Link>
        <Link href="/contact" className="btn btn-ghost-light">
          Discuss your search
        </Link>
      </PageHero>
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <IndustryGrid industries={industries} openByIndustry={openByIndustry} />
        </div>
      </section>
      <section className="border-t border-line bg-white py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading eyebrow="At a glance" title="Roles we recruit for" />
          <div className="mt-10">
            <RoleCategoryCards categories={industries} />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
