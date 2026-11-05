"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArcMotif } from "@/components/ui";
import { DEFAULT_SETTINGS } from "@/lib/site";

/**
 * Branded error page for unexpected failures inside a page.
 * Shows a reference code (Next.js error digest) so a visitor can quote it, never a stack trace.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[page error]", error.digest ?? error.name);
  }, [error]);

  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-white">
      <ArcMotif className="pointer-events-none absolute -right-32 top-0 -z-10 h-[36rem] w-[36rem] text-gold/[0.07]" />
      <div className="container-sw py-28 md:py-40">
        <p className="eyebrow text-gold">Something went wrong</p>
        <h1 className="mt-4 max-w-3xl text-[2.6rem] md:text-[4rem]">
          This page didn&rsquo;t <span className="text-gold">balance.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-dark">
          We couldn&rsquo;t load this page just now. Try again, or call us on{" "}
          <a href={`tel:${DEFAULT_SETTINGS.phoneHref}`} className="font-bold text-white underline underline-offset-4 hover:text-gold">
            {DEFAULT_SETTINGS.phone}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-gold">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost-light">
            Go to the homepage
          </Link>
        </div>
        {error.digest ? <p className="mt-10 font-mono text-xs text-white/40">Reference: {error.digest}</p> : null}
      </div>
    </section>
  );
}
