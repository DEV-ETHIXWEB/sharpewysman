"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type Step = { title: string; body: string };

const STEP_MS = 2700;
const SIZE = 500; // ring box, px (desktop only)
const CENTER = SIZE / 2;
const NODE_R = 198;
const NODE_D = 76;

/**
 * A process laid out as a clock face on the left: numbered badges sitting
 * right on a solid ring, no text on the ring itself. The active step's
 * title and body appear in a card to the right, swapping in sync as the
 * ring auto-advances or a badge is hovered/clicked. Hovering the ring
 * pauses it. Mobile / no-JS: an ordered list (always rendered for screen
 * readers).
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

  // The highlight arc: a short gold-to-ink segment on the ring, centred on
  // whichever node is active, that glides around as it changes.
  const circumference = 2 * Math.PI * NODE_R;
  const arcFraction = Math.min(0.16, (1 / n) * 0.6);
  const arcLen = circumference * arcFraction;
  const arcRotate = (active / n) * 360 - 90 - (arcFraction * 360) / 2;

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
        {/* Ring + detail card (desktop) */}
        <div className="hidden items-center gap-20 lg:flex lg:justify-center">
          <div
            className="relative shrink-0"
            style={{ width: SIZE, height: SIZE }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <circle cx={CENTER} cy={CENTER} r={NODE_R * 0.52} fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
              <circle cx={CENTER} cy={CENTER} r={NODE_R} fill="none" stroke="var(--color-gold)" strokeWidth="6" strokeOpacity="0.4" />
              {/* Progress arc: glides to sit centred on the active node */}
              <circle
                className="orbit-arc"
                cx={CENTER}
                cy={CENTER}
                r={NODE_R}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${arcLen} ${circumference - arcLen}`}
                style={{ transformOrigin: `${CENTER}px ${CENTER}px`, transform: `rotate(${arcRotate}deg)` }}
              />
            </svg>

            {/* Soft backdrop behind the centre mark, so the ring's middle doesn't read as dead space */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                height: NODE_R * 0.95,
                width: NODE_R * 0.95,
                background: "radial-gradient(circle, var(--color-paper-2) 0%, transparent 72%)",
              }}
            />
            <Image
              src="/images/mark.png"
              alt=""
              width={44}
              height={44}
              className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 opacity-70"
            />

            {track.steps.map((s, i) => {
              const deg = (i / n) * 360;
              const angle = (deg * Math.PI) / 180 - Math.PI / 2;
              const x = CENTER + NODE_R * Math.cos(angle);
              const y = CENTER + NODE_R * Math.sin(angle);
              const on = i === active;

              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => choose(i)}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                  aria-pressed={on}
                  aria-label={s.title}
                  className={`absolute left-0 top-0 flex items-center justify-center rounded-full font-mono text-xl font-bold transition-all duration-300 ${on ? "node-pulse" : ""}`}
                  style={{
                    height: NODE_D,
                    width: NODE_D,
                    transform: `translate(${x - NODE_D / 2}px, ${y - NODE_D / 2}px) scale(${on ? 1.14 : 1})`,
                    background: on ? "var(--color-ink)" : "var(--color-gold)",
                    color: on ? "var(--color-gold)" : "var(--color-ink)",
                    boxShadow: on ? "0 14px 34px -8px rgb(30 29 31 / 0.5)" : "0 4px 14px -6px rgb(30 29 31 / 0.3)",
                    zIndex: on ? 10 : 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* Detail card: swaps with the active step, in sync with the ring */}
          <div className="w-full max-w-lg" aria-live="polite">
            <div key={`${trackId}-${active}`} className="card-pop rounded-2xl border border-line bg-white p-12" style={{ minHeight: 300 }}>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
                Step {String(active + 1).padStart(2, "0")} <span className="text-muted">/ {String(n).padStart(2, "0")}</span>
              </p>
              <h3 className="font-display mt-5 text-4xl leading-snug">{step.title}</h3>
              <p className="mt-5 text-xl leading-relaxed text-muted">{step.body}</p>
            </div>
            <div className="mt-7 flex gap-2.5">
              {track.steps.map((s, i) => (
                // The visible bar stays 8px, but the button itself is padded out to a
                // 28px hit area (pulled back with -my-2.5 so the row height is unchanged).
                <button
                  key={s.title}
                  type="button"
                  onClick={() => choose(i)}
                  aria-label={`Go to step ${i + 1}: ${s.title}`}
                  aria-current={i === active}
                  className="-my-2.5 flex-1 py-2.5"
                >
                  <span
                    className="block h-2 rounded-full transition-all duration-300"
                    style={{
                      background: i === active ? "var(--color-accent)" : "var(--color-line)",
                      transform: i === active ? "scaleY(1.4)" : "none",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
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
