import Link from "next/link";
import type { Job, Stat } from "@/lib/types";
import { Arrow } from "../ui";
import { IconChevronDown } from "../icons";
import { HeroVideo } from "./HeroVideo";
import { EnquiryForm } from "./QuickEnquiry";
import { JobCarousel } from "./JobCarousel";

/**
 * Homepage hero. Two columns on large screens: copy on the left, a standing
 * "start a conversation" form on the right, both over the full-bleed film.
 */
export function Hero({ totalOpen }: { totalOpen: number; stats: Stat[] }) {
  return (
    <section className="on-dark relative isolate min-h-[100svh] overflow-hidden bg-ink text-white">
      {/* Full-bleed background film: a continuous scene behind the copy, not a boxed-in clip */}
      <HeroVideo blend={false} className="absolute inset-0 -z-20 h-full w-full scale-105 opacity-60" />
      {/* Vertical scrim for text contrast, darkest at the seams (header above, next section below) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/75 via-ink/50 to-ink" aria-hidden />
      {/* Soft radial focus behind the copy so the edges stay filmic while the center reads cleanly */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgb(30_29_31/0.55),transparent_70%)]"
        aria-hidden
      />

      <div className="container-sw grid items-start gap-12 pb-16 pt-[10rem] md:pb-20 md:pt-[12.75rem] lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 xl:gap-16">
        <div className="pt-[26px]" style={{ textShadow: "0 1px 8px rgb(0 0 0 / 0.45)" }}>
          <p className="eyebrow text-white/50">Accounting &amp; finance recruiters · Vancouver, BC</p>

          {/* Serif display, weight 400 (the base h1 treatment): one quiet, confident statement */}
          <h1 className="mt-6 max-w-xl text-[2.5rem] sm:text-[3.1rem] lg:text-[3.5rem] 2xl:text-[3.8rem]">
            Hiring accountants is a job for <span className="text-gold">accountants.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/65">
            Founded in 2008 by a Chartered Accountant. Every recruiter on our team is a designated accountant, placing CPAs, controllers and
            finance leaders across Greater Vancouver.
          </p>

          <div className="rise mt-10 flex flex-wrap items-center gap-x-7 gap-y-4" style={{ ["--delay" as string]: "0.1s" }}>
            <Link href="/employers" className="btn btn-gold">
              Hire with us <Arrow />
            </Link>
            <Link href="/jobs" className="link-arrow text-white/75 hover:text-white">
              Browse {totalOpen} open roles <Arrow />
            </Link>
          </div>


        </div>

        {/* Standing enquiry card: always there beside the copy, not tucked behind a click */}
        <div className="rise w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-end" style={{ ["--delay" as string]: "0.15s" }}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141315]/95 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur-xl">
            <div className="h-[3px] bg-gold" aria-hidden />
            <EnquiryForm />
          </div>
        </div>
      </div>

      {/* Scroll cue: a quiet hint there's more, for tall viewports where the hero fills the screen */}
      <div
        aria-hidden
        className="pulse-cue pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-1.5 text-white/45"
      >
        <span className="eyebrow text-[0.65rem] tracking-[0.25em]">Scroll</span>
        <IconChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
    </section>
  );
}

/**
 * "Recruiting now": the live ledger of open roles, each ticked as an auditor would.
 */
export function OpenRoles({ jobs, totalOpen }: { jobs: Job[]; totalOpen: number }) {
  return (
    <section className="py-20 md:py-28">
      <div className="container-sw">
        <div data-reveal>
          <p className="eyebrow text-maroon">
            <span className="eyebrow-rule" aria-hidden />
            Recruiting now
          </p>
          <h2 className="mt-4 text-[2.1rem] md:text-5xl">This month&rsquo;s open roles</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Every role is briefed and screened by a recruiter who has worked in the profession. Many of our searches are confidential, so this
            is only part of the picture.
          </p>
        </div>

        <JobCarousel jobs={jobs} totalOpen={totalOpen} />
      </div>
    </section>
  );
}
