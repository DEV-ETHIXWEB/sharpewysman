"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type Step = { title: string; body: string };

/**
 * A process laid out around the concentric rings of the Sharpe Wysman mark.
 * Desktop: interactive orbit, the selected step's detail sits in the centre.
 * Mobile / no-JS: an ordered list (always rendered for screen readers).
 */
export function ProcessOrbit({ tracks }: { tracks: { id: string; label: string; steps: readonly Step[] }[] }) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const track = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const n = track.steps.length;
  const step = track.steps[Math.min(active, n - 1)];
  const STEP_MS = 3800;

  // Only animate while visible.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Walk through the steps once, then stop. Any interaction stops it immediately.
  useEffect(() => {
    if (!auto || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 1024) return;
    const id = window.setTimeout(() => {
      if (active >= n - 1) setAuto(false);
      else setActive((a) => a + 1);
    }, STEP_MS);
    return () => window.clearTimeout(id);
  }, [auto, inView, active, n]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

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
                setAuto(true);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${t.id === trackId ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      <div id={`${uid}-panel`} role={tracks.length > 1 ? "tabpanel" : undefined} aria-labelledby={tracks.length > 1 ? `${uid}-tab-${trackId}` : undefined} className="mt-10 w-full">
        {/* Orbit (desktop) */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[44rem] lg:block">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-line)" strokeWidth="0.35" strokeDasharray="1 1.2" />
            <circle cx="50" cy="50" r="27" fill="none" stroke="var(--color-line)" strokeWidth="0.35" strokeDasharray="1 1.2" />
            {/* progress arc up to the active step */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="0.7"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${(active / n) * 100} 100`}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray .6s var(--ease-out-quart)" }}
            />
          </svg>

          {/* centre detail */}
          <div className="absolute left-1/2 top-1/2 flex w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
            <Image src="/images/mark.png" alt="" width={56} height={56} className="mb-4 h-12 w-12" />
            <p className="font-mono text-xs uppercase tracking-widest text-maroon">
              Step {active + 1} of {n}
            </p>
            <p key={`t-${trackId}-${active}`} className="quote-in mt-2 font-display text-[1.7rem] leading-tight" aria-live={auto ? "off" : "polite"}>
              {step.title}
            </p>
            <p key={`${trackId}-${active}`} className="quote-in mt-3 text-[0.95rem] leading-relaxed text-muted">
              {step.body}
            </p>
            {auto && inView ? (
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-16 overflow-hidden bg-line">
                  <span key={`${trackId}-${active}`} className="progress-line block h-full bg-maroon" style={{ ["--dur" as string]: `${STEP_MS}ms` }} />
                </span>
                <button type="button" onClick={() => setAuto(false)} className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink">
                  Pause
                </button>
              </div>
            ) : null}
          </div>

          {track.steps.map((s, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 40 * Math.cos(angle);
            const y = 50 + 40 * Math.sin(angle);
            const on = i === active;
            const done = i < active;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => choose(i)}
                onMouseEnter={() => choose(i)}
                onFocus={() => choose(i)}
                aria-pressed={on}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border font-mono text-lg transition duration-300 ${
                    on
                      ? "scale-110 border-ink bg-ink text-gold shadow-xl shadow-ink/20"
                      : done
                        ? "border-gold bg-gold text-ink"
                        : "border-line bg-white text-ink group-hover:border-ink"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-3 w-36 rounded-md bg-paper px-2 text-center text-sm font-bold leading-tight transition ${on ? "text-maroon" : "text-ink"}`}
                >
                  {s.title}
                </span>
              </button>
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
