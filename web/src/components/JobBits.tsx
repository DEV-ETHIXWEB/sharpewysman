import Link from "next/link";
import type { Job } from "@/lib/types";
import { Arrow } from "./ui";
import { IconPin, IconSalary } from "./icons";

export function formatSalary(job: Job): string | null {
  if (!job.salaryMin) return null;
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  return job.salaryMax && job.salaryMax !== job.salaryMin ? `${k(job.salaryMin)} to ${k(job.salaryMax)}` : k(job.salaryMin);
}

/** A ruled row in a list of jobs. */
export function JobRow({ job, industryName, index }: { job: Job; industryName?: string; index?: number }) {
  const salary = formatSalary(job);
  return (
    <li className={`group relative border-b border-line ${index !== undefined ? "row-in" : ""}`} style={index !== undefined ? { ["--i" as string]: index } : undefined}>
      <div className="grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
        <div>
          <h3 className="font-display text-2xl text-ink transition group-hover:text-accent md:text-[1.7rem]">
            <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0">
              {job.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-muted">{job.summary}</p>
        </div>
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.8rem] text-muted md:flex-col md:items-end md:text-right">
          <div>
            <dt className="sr-only">Location</dt>
            <dd className="icon-inline">
              <IconPin className="h-3.5 w-3.5 text-accent" />
              {job.location}
            </dd>
          </div>
          {industryName ? (
            <div>
              <dt className="sr-only">Industry</dt>
              <dd>{industryName}</dd>
            </div>
          ) : null}
          {salary ? (
            <div>
              <dt className="sr-only">Salary</dt>
              <dd className="icon-inline font-medium text-ink">
                <IconSalary className="h-3.5 w-3.5 text-accent" />
                {salary}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
      <Arrow className="pointer-events-none absolute right-0 top-7 hidden h-4 w-4 -translate-x-2 text-accent opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 md:block" />
    </li>
  );
}
