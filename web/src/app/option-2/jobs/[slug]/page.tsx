import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArcMotif, Arrow, JsonLd, TickList } from "@/option-2/components/ui";
import { MobileApplyBar } from "@/option-2/components/MobileApplyBar";
import { EnquiryForm } from "@/option-2/components/EnquiryForm";
import { IconBriefcase, IconPin, IconSalary } from "@/option-2/components/icons";
import { JobRow, formatSalary } from "@/option-2/components/JobBits";
import { cleanHtml } from "@/lib/sanitize";
import { getIndustries, getJob, getJobs, getOpenJobs, getSettings } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata, jobPostingLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return buildMetadata({
    title: `${job.title} Job in ${job.city}, BC`,
    description: job.summary,
    path: `/jobs/${job.slug}`,
    noindex: job.status !== "open",
  });
}

const EMPLOYMENT: Record<string, string> = { FULL_TIME: "Full-time, permanent", PART_TIME: "Part-time", CONTRACTOR: "Contract", TEMPORARY: "Temporary" };

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const [job, industries, settings, open] = await Promise.all([getJob(slug), getIndustries(), getSettings(), getOpenJobs()]);
  if (!job) notFound();
  const industry = industries.find((i) => i.slug === job.industry);
  const salary = formatSalary(job);
  const related = open.filter((j) => j.slug !== job.slug && j.industry === job.industry).slice(0, 3);
  const isOpen = job.status === "open";

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Jobs", path: "/jobs" },
            { name: job.title, path: `/jobs/${job.slug}` },
          ]),
          ...(isOpen ? [jobPostingLd({ ...job, body: cleanHtml(job.body) }, settings)] : []),
        ]}
      />

      <section id="job-hero" className="on-dark relative overflow-hidden bg-ink text-white">
        <ArcMotif className="spin-slow pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] text-gold/[0.06]" />
        <div className="container-sw relative pb-14 pt-[7.5rem] md:pb-20 md:pt-[9.25rem]">
          <p className="eyebrow text-gold">{industry?.name ?? "Current opportunity"}</p>
          <h1 className="lift mt-4 max-w-4xl text-[2.4rem] md:text-[3.4rem]">{job.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-dark md:text-xl">{job.summary}</p>
          <dl className="mt-10 grid max-w-3xl gap-px overflow-hidden rounded-xl bg-line-dark font-mono text-sm sm:grid-cols-3">
            {(
              [
                ["Location", job.location, IconPin],
                ["Type", EMPLOYMENT[job.employmentType], IconBriefcase],
                ["Salary", salary ? `${salary} ${job.salaryNote ?? ""}`.trim() : "Discussed in confidence", IconSalary],
              ] as const
            ).map(([k, v, Icon]) => (
              <div key={k} className="relative bg-ink-2 py-4 pl-[3.25rem] pr-5">
                <dt className="text-xs uppercase tracking-widest text-muted-dark">
                  <Icon className="absolute left-5 top-[1.1rem] h-5 w-5 text-gold" />
                  {k}
                </dt>
                <dd className="mt-1 text-white">{v}</dd>
              </div>
            ))}
          </dl>
          {isOpen ? (
            <a href="#apply" className="btn btn-gold mt-8">
              Apply for this role <Arrow />
            </a>
          ) : null}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-sw grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <article data-reveal>
            {!isOpen ? (
              <div role="status" className="mb-10 rounded-xl border border-maroon/30 bg-maroon-soft p-6">
                <p className="font-bold text-maroon-deep">This role has been filled.</p>
                <p className="mt-1 text-maroon-deep/80">
                  Browse our <Link href="/jobs" className="underline">current jobs</Link>, or register so we can tell you about similar roles.
                </p>
              </div>
            ) : null}
            <h2 className="text-3xl">About the role</h2>
            <div className="prose-sw mt-6" dangerouslySetInnerHTML={{ __html: cleanHtml(job.body) }} />
            {job.highlights.length ? (
              <>
                <h2 className="mt-12 text-3xl">What&rsquo;s on offer</h2>
                <TickList items={job.highlights} className="mt-6 text-[1.0625rem]" />
              </>
            ) : null}
            {job.requirements.length ? (
              <>
                <h2 className="mt-12 text-3xl">What you&rsquo;ll bring</h2>
                <TickList items={job.requirements} className="mt-6 text-[1.0625rem]" />
              </>
            ) : null}
            <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
              Our client&rsquo;s name is kept confidential at this stage. We&rsquo;ll share full details in a confidential conversation before anything is sent to
              the employer, and we never share your resume without your permission.
            </p>
          </article>

          {isOpen ? (
            <aside id="apply" className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-3xl">Apply for this role</h2>
              <p className="mt-2 text-muted">
                Prefer to talk first? Call{" "}
                <a href={`tel:${settings.phoneHref}`} className="font-bold tabular-nums text-ink">
                  {settings.phone}
                </a>
                .
              </p>
              <div className="mt-6">
                <Suspense fallback={<div className="h-[36rem] rounded-xl border border-line bg-white" />}>
                  <EnquiryForm mode="apply" job={{ slug: job.slug, title: job.title }} phone={settings.phone} phoneHref={settings.phoneHref} />
                </Suspense>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {isOpen ? <MobileApplyBar title={job.title} salary={salary} /> : null}

      {related.length ? (
        <section className="border-t border-line bg-white py-16 md:py-24">
          <div className="container-sw">
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-3xl md:text-4xl">Similar roles</h2>
              <Link href="/jobs" className="link-arrow shrink-0">
                All jobs <Arrow />
              </Link>
            </div>
            <ul className="mt-8 border-t border-ink">
              {related.map((j) => (
                <JobRow key={j.slug} job={j} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
