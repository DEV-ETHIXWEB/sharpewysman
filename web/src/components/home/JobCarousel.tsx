"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Job } from "@/lib/types";
import { Arrow } from "../ui";
import { IconPin, IconSalary } from "../icons";
import { formatSalary } from "../JobBits";

const AUTO_INTERVAL = 3800;

/**
 * Horizontal, snap-scrolling row of open roles. Auto-advances on its own,
 * pausing the moment a visitor hovers, touches, or uses the arrow controls
 * (which sit below the row, bottom-right) — manual control always wins.
 * Loops back to the start once it reaches the end. Ends in a "view all"
 * card rather than a separate button, so it reads as one continuous row.
 */
export function JobCarousel({ jobs, totalOpen }: { jobs: Job[]; totalOpen: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
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

  // Auto-rotation: advance one card at a time, loop back to the start at the end.
  useEffect(() => {
    if (jobs.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollBy(1);
      }
    }, AUTO_INTERVAL);

    return () => window.clearInterval(id);
  }, [jobs.length]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div className="mt-10" onMouseEnter={pause} onMouseLeave={resume} onTouchStart={pause} onTouchEnd={resume}>
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

        <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
          {jobs.map((job) => {
            const salary = formatSalary(job);
            return (
              <Link
                key={job.slug}
                href={`/jobs/${job.slug}`}
                data-reveal="fade"
                className="group flex w-[260px] shrink-0 snap-start flex-col rounded-xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-maroon/30 hover:shadow-xl hover:shadow-ink/10 sm:w-[290px]"
              >
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">{job.employmentType}</p>
                <h3 className="mt-2 font-display text-xl leading-snug text-ink transition group-hover:text-maroon">{job.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{job.summary}</p>
                <dl className="mt-4 space-y-1.5 font-mono text-xs text-muted">
                  <div>
                    <dt className="sr-only">Location</dt>
                    <dd className="icon-inline">
                      <IconPin className="h-3.5 w-3.5 text-maroon" />
                      {job.location}
                    </dd>
                  </div>
                  {salary ? (
                    <div>
                      <dt className="sr-only">Salary</dt>
                      <dd className="icon-inline font-medium text-ink">
                        <IconSalary className="h-3.5 w-3.5 text-maroon" />
                        {salary}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <span className="link-arrow mt-4 self-start text-sm">
                  View role <Arrow />
                </span>
              </Link>
            );
          })}

          <Link
            href="/jobs"
            data-reveal="fade"
            className="group flex w-[260px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-paper-2/60 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-maroon sm:w-[290px]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-gold transition duration-300 group-hover:scale-110 group-hover:bg-maroon">
              <Arrow className="h-4 w-4" />
            </span>
            <span className="font-display text-lg text-ink">View all {totalOpen} roles</span>
            <span className="text-sm text-muted">See every open search</span>
          </Link>
        </div>
      </div>

      {/* Manual override: always available alongside the autoplay */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            pause();
            scrollBy(-1);
          }}
          disabled={!canLeft}
          aria-label="Previous roles"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition duration-300 hover:border-maroon hover:text-maroon disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
        >
          <Arrow className="h-4 w-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => {
            pause();
            scrollBy(1);
          }}
          disabled={!canRight}
          aria-label="Next roles"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition duration-300 hover:border-maroon hover:text-maroon disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
        >
          <Arrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
