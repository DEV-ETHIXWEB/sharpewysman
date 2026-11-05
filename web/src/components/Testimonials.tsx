"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import { IconQuote } from "./icons";

const CARD_W = 360;
const CARD_GAP = 24;
/** Minimum px-width a single (pre-duplicate) list must reach so the
 * translateX(-50%) loop never runs out of content on wide viewports. */
const MIN_LIST_W = 3840;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function Card({ t, dark }: { t: Testimonial; dark: boolean }) {
  return (
    <figure
      style={{ width: CARD_W, minHeight: 260 }}
      className={`flex shrink-0 flex-col rounded-2xl border p-7 transition duration-300 ${
        dark ? "border-white/10 bg-white/[0.04] hover:border-gold/40" : "border-line bg-white hover:border-maroon/30 hover:shadow-xl hover:shadow-ink/5"
      }`}
    >
      <IconQuote className={`h-7 w-11 shrink-0 ${dark ? "text-gold" : "text-maroon"}`} />
      <blockquote className={`mt-4 flex-1 font-serif text-[1.05rem] leading-relaxed ${dark ? "text-white/90" : "text-ink"}`}>
        <p className="line-clamp-5">{t.quote}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base ${dark ? "bg-gold text-ink" : "bg-ink text-gold"}`}>
          {initialsOf(t.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold">{t.name}</span>
          <span className={`block truncate text-sm ${dark ? "text-muted-dark" : "text-muted"}`}>
            {t.role}, {t.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ items, dark, reverse, duration, paused }: { items: Testimonial[]; dark: boolean; reverse?: boolean; duration: string; paused: boolean }) {
  // A short testimonial list (as few as 3) is narrower than most viewports.
  // The seamless loop needs one full (pre-duplicate) list to be at least as
  // wide as the viewport, so repeat the set until it comfortably is.
  const reps = Math.max(1, Math.ceil(MIN_LIST_W / (items.length * (CARD_W + CARD_GAP))));

  return (
    <div className="marquee overflow-hidden" data-paused={paused} style={{ ["--marquee-dur" as string]: duration }}>
      <div className={`marquee-track gap-6 ${reverse ? "marquee-track-reverse" : ""}`}>
        {[false, true].map((dup) => (
          <ul key={String(dup)} aria-hidden={dup || undefined} className={`flex shrink-0 items-stretch gap-6 ${dup ? "marquee-dup" : ""}`}>
            {Array.from({ length: reps }).map((_, rep) =>
              items.map((t, i) => (
                <li key={`${t.id}-${rep}-${i}`} aria-hidden={!dup && rep > 0 ? true : undefined}>
                  <Card t={t} dark={dark} />
                </li>
              )),
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Client and candidate testimonials as a two-row infinite marquee (rows
 * scroll opposite directions, at different speeds). Hovering or focusing
 * either row pauses it; a visible pause control covers everyone else
 * (WCAG 2.2.2: content that auto-moves for more than five seconds needs
 * one). Respects prefers-reduced-motion globally (wraps to a static grid).
 */
export function Testimonials({ items, tone = "light" }: { items: Testimonial[]; tone?: "light" | "dark" }) {
  const groups = [
    { id: "client" as const, label: "Employers" },
    { id: "candidate" as const, label: "Candidates" },
  ].filter((g) => items.some((t) => t.audience === g.id));
  const [aud, setAud] = useState(groups[0]?.id ?? "client");
  const [paused, setPaused] = useState(false);
  const dark = tone === "dark";
  const list = items.filter((t) => t.audience === aud);
  if (!list.length) return null;

  const rowB = list.length > 1 ? [...list].reverse() : list;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {groups.length > 1 ? (
          <div role="tablist" aria-label="Testimonials from" className={`inline-flex rounded-full border p-1 ${dark ? "border-white/15" : "border-line bg-white"}`}>
            {groups.map((g) => (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={aud === g.id}
                onClick={() => setAud(g.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  aud === g.id ? (dark ? "bg-gold text-ink" : "bg-ink text-white") : dark ? "text-white/75 hover:text-white" : "text-muted hover:text-ink"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Play scrolling testimonials" : "Pause scrolling testimonials"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition motion-reduce:hidden ${
            dark ? "border-white/15 text-white/75 hover:border-gold hover:text-gold" : "border-line text-muted hover:border-ink hover:text-ink"
          }`}
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

      <div key={aud} className="relative mx-[calc(50%-50vw)] mt-10 w-screen space-y-6">
        <Row items={list} dark={dark} duration="46s" paused={paused} />
        {rowB.length > 1 ? <Row items={rowB} dark={dark} reverse duration="60s" paused={paused} /> : null}
      </div>
    </div>
  );
}
