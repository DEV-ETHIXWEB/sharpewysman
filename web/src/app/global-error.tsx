"use client";

import "./(option-1)/globals.css";
import { DEFAULT_SETTINGS } from "@/lib/site";

/**
 * Last-resort error page, used only if the root layout itself fails.
 * Self-contained: no header, footer or data fetching.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-CA">
      <body className="flex min-h-dvh items-center bg-ink text-white">
        <main className="container-sw py-24">
          <p className="eyebrow text-gold">Sharpe Wysman</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">We&rsquo;ll be right back.</h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            The website couldn&rsquo;t load just now. Try again in a moment, or call us on{" "}
            <a href={`tel:${DEFAULT_SETTINGS.phoneHref}`} className="font-bold text-white underline underline-offset-4">
              {DEFAULT_SETTINGS.phone}
            </a>
            .
          </p>
          <button type="button" onClick={reset} className="btn btn-gold mt-10">
            Try again
          </button>
          {error.digest ? <p className="mt-10 font-mono text-xs text-white/40">Reference: {error.digest}</p> : null}
        </main>
      </body>
    </html>
  );
}
