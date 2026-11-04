"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type Step = { title: string; body: string };

const STEP_MS = 2700;
const SIZE = 540; // ring box, px (desktop only) — generous enough that a 6-step track (candidates) clears the hub with real margin, not just the 4-step one
const CENTER = SIZE / 2;
const NODE_R = 225;
const NODE_D = 68;
const STEM_H = 16;
const LABEL_W = 130;
const HUB_W = 180; // fixed, so the centre panel's height is predictable and never reaches the badges

/**
 * A process laid out as a clock face, centred, numbered badges sitting
 * right on a solid ring. Every step's label stays visible under its own
 * badge; only the centre panel (the "tooltip") and the active badge's
 * colour change as it auto-advances. Hovering the ring pauses it.
 * Mobile / no-JS: an ordered list (always rendered for screen readers).
 */
export function ProcessOrbit({ tracks }: { tracks: { id: string; label: string; steps: readonly Step[] }[] }) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const track = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const n = track.steps.length;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Loops forever: pause (hover) is the only thing that stops it.
  useEffect(() => {
    if (paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 1024) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), STEP_MS);
    return () => window.clearInterval(id);
  }, [paused, inView, n]);

  const choose = (i: number) => setActive(i);
  const step = track.steps[active];

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center">
      {tracks.length > 1 ? (
        <div role="tablist" aria-label="Choose a process" className="inline-flex rounded-full border border-line bg-white p-1">
          {tracks.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`${uid}-tab-${t.id}`}
              aria-selected={t.id === trackId}
              aria-controls={`${uid}-panel`}
              onClick={() => {
                setTrackId(t.id);
                setActive(0);
                setPaused(false);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${t.id === trackId ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div id={`${uid}-panel`} role={tracks.length > 1 ? "tabpanel" : undefined} aria-labelledby={tracks.length > 1 ? `${uid}-tab-${trackId}` : undefined} className="mt-12 w-full">
        {/* Clock (desktop) */}
        <div
          className="relative mx-auto hidden lg:block"
          style={{ width: SIZE, height: SIZE }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx={CENTER} cy={CENTER} r={NODE_R * 0.52} fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
            <circle cx={CENTER} cy={CENTER} r={NODE_R} fill="none" stroke="var(--color-gold)" strokeWidth="6" />
          </svg>

          {/* Soft backdrop so the centre panel reads as its own place, without a hard box */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              height: NODE_R * 0.95,
              width: NODE_R * 0.95,
              background: "radial-gradient(circle, var(--color-paper-2) 0%, transparent 72%)",
            }}
          />

          {/* Centre tooltip: swaps with the active step, replays its pop-in each time. Fixed
              width and clamped lines keep its height predictable, so it can never grow into
              the badges above or below it. */}
          <div
            key={`${trackId}-${active}`}
            className="card-pop absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ width: HUB_W }}
          >
            <Image src="/images/mark.png" alt="" width={32} height={32} className="h-8 w-8" />
            <h3 className="font-display mt-3 text-xl leading-tight line-clamp-2">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted line-clamp-3">{step.body}</p>
          </div>

          {track.steps.map((s, i) => {
            const deg = (i / n) * 360;
            const angle = (deg * Math.PI) / 180 - Math.PI / 2;
            const x = CENTER + NODE_R * Math.cos(angle);
            const y = CENTER + NODE_R * Math.sin(angle);
            const on = i === active;

            return (
              <div
                key={s.title}
                className="absolute left-0 top-0"
                style={{ height: NODE_D, width: NODE_D, transform: `translate(${x - NODE_D / 2}px, ${y - NODE_D / 2}px)` }}
              >
                <button
                  type="button"
                  onClick={() => choose(i)}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                  aria-pressed={on}
                  aria-label={s.title}
                  className="absolute inset-0 flex items-center justify-center rounded-full font-mono text-lg font-bold transition-all duration-300"
                  style={{
                    background: on ? "var(--color-ink)" : "var(--color-gold)",
                    color: on ? "var(--color-gold)" : "var(--color-ink)",
                    transform: `scale(${on ? 1.1 : 1})`,
                    boxShadow: on ? "0 12px 30px -8px rgb(30 29 31 / 0.45)" : "0 4px 14px -6px rgb(30 29 31 / 0.3)",
                    zIndex: on ? 10 : 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>

                <span aria-hidden className="absolute left-1/2 top-full -translate-x-1/2 bg-gold" style={{ height: STEM_H, width: 1 }} />
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center text-sm font-bold leading-snug"
                  style={{ top: NODE_D + STEM_H, width: LABEL_W, color: on ? "var(--color-ink)" : "var(--color-muted)" }}
                >
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* List (mobile & tablet) */}
        <ol className="relative space-y-0 lg:hidden">
          {track.steps.map((s, i) => (
            <li key={s.title} data-reveal style={{ ["--i" as string]: i }} className="relative grid grid-cols-[3.25rem_1fr] gap-4 pb-8 last:pb-0">
              {i < n - 1 ? <span className="absolute left-[1.6rem] top-14 bottom-0 w-px bg-line" aria-hidden /> : null}
              <span className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-ink bg-white font-mono text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-2.5">
                <h3 className="font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
