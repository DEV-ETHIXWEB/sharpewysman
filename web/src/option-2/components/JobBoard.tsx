"use client";

import { useMemo, useState } from "react";
import type { Job } from "@/lib/types";
import { JobRow } from "./JobBits";
import { IconSearch } from "./icons";

/** Filterable list of open roles. Filtering is client-side; all roles are in the HTML for crawlers. */
export function JobBoard({ jobs, industries }: { jobs: Job[]; industries: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");
  const names = Object.fromEntries(industries.map((i) => [i.slug, i.name]));
  const withJobs = industries.filter((i) => jobs.some((j) => j.industry === i.slug));

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (industry === "all" || j.industry === industry) &&
        (!term || [j.title, j.summary, j.location].some((s) => s.toLowerCase().includes(term))),
    );
  }, [jobs, q, industry]);

  return (
    <div>
      <h2 className="sr-only">Open roles</h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-96">
          <label htmlFor="job-search" className="sr-only">
            Search jobs
          </label>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-[1.15rem] w-[1.15rem] -translate-y-1/2 text-muted" />
          <input
            id="job-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, skill or location"
            className="field !rounded-full !pl-11"
          />
        </div>
        {withJobs.length > 1 ? (
          <div role="group" aria-label="Filter by industry" className="flex flex-wrap gap-2">
            {[{ slug: "all", name: "All" }, ...withJobs].map((i) => (
              <button
                key={i.slug}
                type="button"
                aria-pressed={industry === i.slug}
                onClick={() => setIndustry(i.slug)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${industry === i.slug ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
              >
                {i.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "role" : "roles"}
      </p>
      {filtered.length ? (
        <ul className="mt-3 border-t border-ink">
          {filtered.map((j, i) => (
            <JobRow key={`${industry}-${q}-${j.slug}`} job={j} industryName={names[j.industry]} index={Math.min(i, 8)} />
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-2xl">No roles match &ldquo;{q}&rdquo;</p>
          <p className="mt-2 text-muted">Try a broader search, or register your resume and we&rsquo;ll contact you when a matching role comes in.</p>
          <button type="button" onClick={() => { setQ(""); setIndustry("all"); }} className="btn btn-ghost mt-6">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
