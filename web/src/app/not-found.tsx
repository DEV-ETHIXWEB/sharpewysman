import Link from "next/link";
import type { Metadata } from "next";
import { ArcMotif, Arrow } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-white">
      <ArcMotif className="pointer-events-none absolute -right-32 top-0 -z-10 h-[36rem] w-[36rem] text-gold/[0.07]" />
      <div className="container-sw grid gap-14 py-28 md:py-36 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
        <div>
        <p className="eyebrow text-gold">Error 404</p>
        <h1 className="mt-4 max-w-3xl text-[2.6rem] md:text-[4rem]">
          This page doesn&rsquo;t <span className="text-gold">reconcile.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-dark">
          The page you&rsquo;re looking for has moved or no longer exists. If you followed a link to a job, the role may have been filled.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/jobs" className="btn btn-gold">
            Browse current jobs <Arrow />
          </Link>
          <Link href="/" className="btn btn-ghost-light">
            Go to the homepage
          </Link>
        </div>
        </div>
        <nav aria-label="Popular pages" className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <p className="eyebrow text-white/60">Popular pages</p>
          <ul className="mt-4 divide-y divide-white/10">
            {[
              ["/employers", "Hire with us"],
              ["/candidates", "Find your next role"],
              ["/industries", "Industries we serve"],
              ["/about", "About Sharpe Wysman"],
              ["/contact", "Contact a recruiter"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="group flex items-center justify-between py-3.5 text-white/85 transition-colors hover:text-gold">
                  {label}
                  <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
