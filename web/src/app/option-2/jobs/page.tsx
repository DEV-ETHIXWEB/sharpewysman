import Link from "next/link";
import { Arrow, JsonLd, PageHero } from "@/option-2/components/ui";
import { JobBoard } from "@/option-2/components/JobBoard";
import { CtaBand } from "@/option-2/components/CtaBand";
import { getIndustries, getOpenJobs } from "@/option-2/wp";
import { abs, breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accounting, Tax & Finance Jobs in Vancouver",
  description:
    "Current accounting and finance jobs in Greater Vancouver: tax managers, audit managers, controllers, directors of finance and partner-track roles. Apply in confidence.",
  path: "/jobs",
});

export default async function JobsPage() {
  const [jobs, industries] = await Promise.all([getOpenJobs(), getIndustries()]);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Jobs", path: "/jobs" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: jobs.map((j, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/jobs/${j.slug}`), name: j.title })),
          },
        ]}
      />
      <PageHero
        eyebrow="Current opportunities"
        title={
          <>
            Find your <span className="text-gold">Everest.</span>
          </>
        }
        intro="Ready for the next challenge? These are some of the roles we're recruiting for now. Many more are confidential, so if you don't see the right fit, register with us."
        image="/images/partners-office.jpg"
        caption="The next step, found with people who know the terrain."
      >
        <Link href="/contact?topic=register" className="btn btn-gold">
          Register your resume <Arrow />
        </Link>
        <Link href="#jobs" className="btn btn-ghost-light">
          Browse {jobs.length} open roles
        </Link>
      </PageHero>
      <section id="jobs" className="scroll-mt-28 py-12 md:py-16">
        <div className="container-sw">
          <JobBoard jobs={jobs} industries={industries.map((i) => ({ slug: i.slug, name: i.name }))} />
        </div>
      </section>
      <CtaBand
        title="Don't see the right role?"
        body="Most of our searches are never advertised. Send your resume in confidence and we'll call you when something fits."
        primary={{ href: "/contact?topic=register", label: "Register your resume" }}
        secondary={{ href: "/candidates", label: "How we help candidates" }}
      />
    </>
  );
}
