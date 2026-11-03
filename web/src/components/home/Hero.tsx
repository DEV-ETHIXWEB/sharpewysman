import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import type { Job } from "@/lib/types";
import { ArcMotif, Arrow, Tick } from "../ui";
import { formatSalary } from "../JobBits";
import { Tilt } from "../motion/Tilt";
import { HeroVideo } from "./HeroVideo";
import { QuickEnquiry } from "./QuickEnquiry";

/**
 * Feathered edges so the film dissolves into the charcoal and reads as part of the background.
 * Two eased linear masks (horizontal x vertical) are intersected: no visible edge on any side.
 */
const ease = (dir: string, a: number, b: number, c?: number, d?: number) =>
  `linear-gradient(${dir}, transparent 0%, rgb(0 0 0 / 0.06) ${a * 0.25}%, rgb(0 0 0 / 0.22) ${a * 0.5}%, rgb(0 0 0 / 0.55) ${a * 0.75}%, #000 ${a}%, #000 ${b}%` +
  (c !== undefined && d !== undefined
    ? `, rgb(0 0 0 / 0.55) ${b + (c - b) * 0.25}%, rgb(0 0 0 / 0.22) ${b + (c - b) * 0.5}%, rgb(0 0 0 / 0.06) ${b + (c - b) * 0.75}%, transparent ${d}%)`
    : `)`);
const feather = (h: string, v: string): CSSProperties => ({
  maskImage: `${h}, ${v}`,
  WebkitMaskImage: `${h}, ${v}`,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
});
// Desktop: long, soft fade on the left (towards the copy), gentle top/bottom, light right edge.
const FEATHER_DESKTOP = feather(ease("to right", 24, 90, 100, 100), ease("to bottom", 16, 82, 100, 100));
// Inline (phones/tablets): even feathering on every side.
const FEATHER_INLINE = feather(ease("to right", 16, 84, 100, 100), ease("to bottom", 18, 80, 100, 100));

/**
 * Homepage hero. The thesis: recruitment done by accountants,
 * carried by the gold handshake film (partnership, sealed in the Sharpe Wysman ring).
 */
export function Hero({ totalOpen }: { totalOpen: number }) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-white">
      <ArcMotif className="spin-slow pointer-events-none absolute -left-56 top-10 -z-10 h-[46rem] w-[46rem] text-white/[0.03]" />

      {/* Film, large desktops: full height on the right */}
      <HeroVideo className="absolute inset-y-0 right-0 -z-10 hidden w-[64%] xl:block" style={FEATHER_DESKTOP} />

      <div className="container-sw pb-16 pt-12 md:pb-20 md:pt-16 xl:flex xl:min-h-[min(46rem,calc(100svh-5rem))] xl:items-center xl:pb-24">
        <div className="xl:max-w-[40rem]">
          <h1>
            <span className="eyebrow block text-gold">Accounting &amp; finance recruiters · Vancouver, BC</span>
            <span className="hero-title mt-6 block text-[2.6rem] sm:text-[3.4rem] lg:text-[4.1rem] xl:text-[3.9rem] 2xl:text-[4.2rem]">
              {"Hiring accountants is a job for".split(" ").map((w, i) => (
                <Fragment key={i}>
                  <span className="word-lift" style={{ ["--w" as string]: i }}>
                    {w}
                  </span>{" "}
                  {i === 1 || i === 5 ? <br className="hidden sm:inline" /> : null}
                </Fragment>
              ))}
              <span className="word-lift relative inline-block whitespace-nowrap text-gold" style={{ ["--w" as string]: 6 }}>
                accountants.
                <Tick
                  animate
                  delay={0.5}
                  strokeWidth={2}
                  className="absolute -right-6 -top-5 h-8 w-10 text-gold sm:-right-9 sm:-top-7 sm:h-11 sm:w-14"
                />
              </span>
            </span>
          </h1>

          {/* Film, phones/tablets/small laptops: full width under the headline */}
          <HeroVideo
            className="relative -mx-5 my-8 aspect-[16/10] sm:-mx-8 md:mx-0 md:my-10 md:aspect-[16/8] xl:hidden"
            style={FEATHER_INLINE}
          />

          <p className="max-w-xl text-lg leading-relaxed text-muted-dark md:text-xl xl:mt-8">
            Sharpe Wysman was founded in 2008 by a Chartered Accountant, and every recruiter on our team is a designated accountant. We place CPAs,
            tax and audit professionals, controllers and finance leaders across Greater Vancouver.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ ["--delay" as string]: "0.1s" }}>
            <Link href="/employers" className="btn btn-gold">
              Hire with us <Arrow />
            </Link>
            <Link href="/jobs" className="btn btn-ghost-light">
              Browse {totalOpen} open roles
            </Link>
          </div>
          <ul className="lift mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70" style={{ ["--delay" as string]: "0.2s" }}>
            {["Free for candidates", "Strictly confidential", "Recruiting since 2008"].map((t, i) => (
              <li key={t} className="flex items-center gap-2">
                <Tick animate delay={0.9 + i * 0.15} className="h-3 w-3.5 text-gold" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Appears when the film settles: card on large screens, prompt bar on phones */}
      <QuickEnquiry />
    </section>
  );
}

/**
 * "Recruiting now": the live ledger of open roles, each ticked as an auditor would.
 */
export function OpenRoles({ jobs, totalOpen }: { jobs: Job[]; totalOpen: number }) {
  const month = new Date().toLocaleDateString("en-CA", { month: "short", year: "numeric" });
  return (
    <section className="py-20 md:py-28">
      <div className="container-sw grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div data-reveal>
          <p className="eyebrow text-maroon">
            <span className="eyebrow-rule" aria-hidden />
            Recruiting now
          </p>
          <h2 className="mt-4 text-[2.1rem] md:text-5xl">This month&rsquo;s open roles</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Every role is briefed and screened by a recruiter who has worked in the profession. Many of our searches are confidential, so this is
            only part of the picture.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn btn-ink">
              Browse all {totalOpen} roles <Arrow />
            </Link>
            <Link href="/contact?topic=register" className="btn btn-ghost">
              Register your resume
            </Link>
          </div>
        </div>

        <div data-reveal className="group/ledger relative" style={{ ["--i" as string]: 1 }}>
          <div
            className="absolute -inset-3 -z-10 rotate-[1.5deg] rounded-2xl bg-gold/90 transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover/ledger:rotate-[2.5deg]"
            aria-hidden
          />
          <Tilt>
            <div className="relative overflow-hidden rounded-xl bg-paper text-ink shadow-2xl shadow-ink/25">
              <div className="flex items-baseline justify-between border-b-2 border-ink px-6 pb-3 pt-5 md:px-8">
                <h3 className="font-display text-2xl">Open roles</h3>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                  <span className="live-dot text-[#2f8a4c]" aria-hidden />
                  Live · {month}
                </p>
              </div>
              {/* Red margin rule, as on ledger paper */}
              <div className="absolute bottom-0 left-[2.6rem] top-[4.1rem] w-px bg-maroon/40 md:left-[3.1rem]" aria-hidden />
              <ul className="ledger-ruled">
                {jobs.map((job, i) => {
                  const salary = formatSalary(job);
                  return (
                    <li key={job.slug}>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="group grid h-[5.5rem] grid-cols-[1.5rem_1fr_auto] items-center gap-4 px-6 transition hover:bg-gold-soft/60 md:px-8"
                      >
                        <Tick animate delay={0.5 + i * 0.15} className="h-3.5 w-4 text-maroon" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold group-hover:text-maroon">{job.title}</span>
                          <span className="block truncate font-mono text-xs text-muted">{job.location}</span>
                        </span>
                        <span className="text-right font-mono text-xs tabular-nums sm:text-sm">
                          {salary ?? <span className="hidden text-muted sm:inline">Confidential</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/jobs"
                className="flex items-center justify-between border-t border-line bg-white px-6 py-4 text-sm font-bold transition hover:text-maroon md:px-8"
              >
                View all {totalOpen} roles
                <Arrow />
              </Link>
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
