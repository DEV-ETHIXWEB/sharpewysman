"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Job } from "@/lib/types";
import { Arrow } from "../ui";
import { IconPin, IconSalary } from "../icons";
import { formatSalary } from "../JobBits";

const EMPLOYMENT: Record<string, string> = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACTOR: "Contract", TEMPORARY: "Temporary" };

/**
 * Horizontal, snap-scrolling row of open roles. Manual only, the arrow
 * controls (bottom-right) and native touch/trackpad scroll are the only way
 * it moves. Ends in a "view all" card rather than a separate button, so it
 * reads as one continuous row.
 */
export function JobCarousel({ jobs, totalOpen }: { jobs: Job[]; totalOpen: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [jobs.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.clientWidth ?? 300) + 16;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="mt-10">
      <div className="relative">
        {/* Edge fades hint there's more to scroll */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-paper to-transparent transition-opacity duration-300 ${canLeft ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-paper to-transparent transition-opacity duration-300 ${canRight ? "opacity-100" : "opacity-0"}`}
        />

        <div ref={trackRef} className="no-scrollbar -mb-8 -mt-3 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-10 pt-3">
          {jobs.map((job) => {
            const salary = formatSalary(job);
            return (
              <Link
                key={job.slug}
                href={`/jobs/${job.slug}`}
                data-reveal="fade"
                className="group flex w-[320px] shrink-0 snap-start flex-col rounded-2xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl hover:shadow-ink/10 sm:w-[360px] sm:p-8"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-muted">{EMPLOYMENT[job.employmentType] ?? job.employmentType}</p>
                <h3 className="font-display mt-3 text-2xl leading-snug text-ink transition group-hover:text-accent">{job.title}</h3>
                <p className="mt-3 line-clamp-2 flex-1 text-base leading-relaxed text-muted">{job.summary}</p>
                <dl className="mt-5 space-y-2 font-mono text-sm text-muted">
                  <div>
                    <dt className="sr-only">Location</dt>
                    <dd className="icon-inline">
                      <IconPin className="h-4 w-4 text-accent" />
                      {job.location}
                    </dd>
                  </div>
                  {salary ? (
                    <div>
                      <dt className="sr-only">Salary</dt>
                      <dd className="icon-inline font-medium text-ink">
                        <IconSalary className="h-4 w-4 text-accent" />
                        {salary}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <span className="link-arrow mt-5 self-start">
                  View role <Arrow />
                </span>
              </Link>
            );
          })}

          <Link
            href="/jobs"
            data-reveal="fade"
            className="group flex w-[320px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-paper-2/60 p-7 text-center transition duration-300 hover:-translate-y-1 hover:border-accent sm:w-[360px] sm:p-8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-gold transition duration-300 group-hover:scale-110 group-hover:bg-accent">
              <Arrow className="h-5 w-5" />
            </span>
            <span className="font-display text-xl text-ink">View all {totalOpen} roles</span>
            <span className="text-base text-muted">See every open search</span>
          </Link>
        </div>
      </div>

      {/* Manual controls: the only way this row moves now */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          aria-label="Previous roles"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition duration-300 hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
        >
          <Arrow className="h-4 w-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          aria-label="Next roles"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition duration-300 hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
        >
          <Arrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
