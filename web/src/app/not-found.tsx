import Link from "next/link";
import { ArcMotif, Arrow } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-white">
      <ArcMotif className="pointer-events-none absolute -right-32 top-0 -z-10 h-[36rem] w-[36rem] text-gold/[0.07]" />
      <div className="container-sw py-28 md:py-40">
        <p className="eyebrow text-gold">Error 404</p>
        <h1 className="hero-title mt-4 max-w-3xl text-[2.6rem] md:text-[4rem]">
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
    </section>
  );
}
