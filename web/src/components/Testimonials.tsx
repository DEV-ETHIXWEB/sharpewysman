"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { Tick } from "./ui";
import { IconQuote } from "./icons";

const ROTATE_MS = 8000;

/**
 * Client and candidate testimonials. One featured quote set large, the rest
 * listed beside it. Rotates automatically while in view, with a visible
 * pause control; choosing a quote stops the rotation.
 */
export function Testimonials({ items, tone = "light" }: { items: Testimonial[]; tone?: "light" | "dark" }) {
  const groups = [
    { id: "client" as const, label: "Employers" },
    { id: "candidate" as const, label: "Candidates" },
  ].filter((g) => items.some((t) => t.audience === g.id));
  const [aud, setAud] = useState(groups[0]?.id ?? "client");
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const list = items.filter((t) => t.audience === aud);
  const featured = list[Math.min(idx, list.length - 1)];
  const dark = tone === "dark";
  const running = playing && !hovered && inView && !reduced && list.length > 1;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % list.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [running, idx, list.length]);

  if (!featured) return null;
  const initials = featured.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div ref={rootRef} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={() => setHovered(false)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {groups.length > 1 ? (
          <div role="tablist" aria-label="Testimonials from" className={`inline-flex rounded-full border p-1 ${dark ? "border-white/15" : "border-line bg-white"}`}>
            {groups.map((g) => (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={aud === g.id}
                aria-controls={`${uid}-panel`}
                onClick={() => {
                  setAud(g.id);
                  setIdx(0);
                }}
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
        {list.length > 1 && !reduced ? (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={!playing}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${
              dark ? "border-white/15 text-white/75 hover:border-gold hover:text-gold" : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {playing ? (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden>
                <rect x="2.5" y="1.5" width="2.4" height="9" rx="1" />
                <rect x="7.1" y="1.5" width="2.4" height="9" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden>
                <path d="M3 1.8v8.4c0 .5.5.8.9.5l6.3-4.2c.4-.2.4-.8 0-1L3.9 1.3c-.4-.3-.9 0-.9.5Z" />
              </svg>
            )}
            {playing ? "Pause" : "Play"}
          </button>
        ) : null}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <figure key={`${aud}-${featured.id}`} className="quote-in" aria-live={running ? "off" : "polite"}>
          <IconQuote className={`h-9 w-14 ${dark ? "text-gold" : "text-maroon"}`} />
          <blockquote className={`mt-6 font-serif text-[1.4rem] leading-[1.5] md:text-[1.75rem] ${dark ? "text-white" : "text-ink"}`}>
            <p>{featured.quote}</p>
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-lg ${dark ? "bg-gold text-ink" : "bg-ink text-gold"}`}>
              {initials}
            </span>
            <span>
              <span className="block font-bold">{featured.name}</span>
              <span className={`block text-sm ${dark ? "text-muted-dark" : "text-muted"}`}>
                {featured.role}, {featured.company}
              </span>
            </span>
          </figcaption>
        </figure>

        <ul className={`divide-y self-start border-y ${dark ? "divide-white/10 border-white/10" : "divide-line border-line"}`}>
          {list.map((t, i) => (
            <li key={t.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIdx(i);
                  setPlaying(false);
                }}
                aria-pressed={i === idx}
                className={`flex w-full items-center gap-4 py-4 text-left transition ${
                  i === idx ? "" : dark ? "text-white/75 hover:text-white" : "text-muted hover:text-ink"
                }`}
              >
                <Tick className={`h-3.5 w-4 shrink-0 transition ${i === idx ? (dark ? "text-gold" : "text-maroon") : "opacity-0"}`} />
                <span>
                  <span className={`block ${i === idx ? "font-bold" : "font-normal"}`}>{t.name}</span>
                  <span className={`block text-sm ${dark ? "text-muted-dark" : "text-muted"}`}>
                    {t.role}, {t.company}
                  </span>
                </span>
              </button>
              {i === idx && running ? (
                <span className="absolute inset-x-0 -bottom-px h-px overflow-hidden" aria-hidden>
                  <span key={`${aud}-${idx}`} className={`progress-line block h-full ${dark ? "bg-gold" : "bg-maroon"}`} style={{ ["--dur" as string]: `${ROTATE_MS}ms` }} />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
