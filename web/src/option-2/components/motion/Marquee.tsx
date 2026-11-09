"use client";

import { useState, type ReactNode } from "react";

/** Continuous marquee with a visible pause control (WCAG 2.2.2). Pauses on hover/focus too. */
export function Marquee({ items, label }: { items: ReactNode[]; label: string }) {
  const [paused, setPaused] = useState(false);
  const list = (dup: boolean) => (
    <ul aria-hidden={dup || undefined} className={`flex shrink-0 items-center gap-x-14 pr-14 ${dup ? "marquee-dup" : ""}`}>
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-14 whitespace-nowrap">
          {it}
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className="marquee min-w-0 flex-1 overflow-hidden" data-paused={paused} aria-label={label} role="region">
        <div className="marquee-track">
          {list(false)}
          {list(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play scrolling list" : "Pause scrolling list"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink motion-reduce:hidden"
      >
        {paused ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M3 1.8v8.4c0 .5.5.8.9.5l6.3-4.2c.4-.2.4-.8 0-1L3.9 1.3c-.4-.3-.9 0-.9.5Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden>
            <rect x="2.5" y="1.5" width="2.4" height="9" rx="1" />
            <rect x="7.1" y="1.5" width="2.4" height="9" rx="1" />
          </svg>
        )}
      </button>
    </div>
  );
}
