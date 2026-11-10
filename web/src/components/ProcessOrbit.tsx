"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type Step = { title: string; body: string };

/**
 * The process, led by the visitor's own scrolling: every step is always readable, and the
 * ring (the concentric mark of the Sharpe Wysman logo) stays beside them, filling as they
 * read. Nothing autoplays and scrolling is never taken over. Phones get the list alone.
 */
export function ProcessOrbit({ tracks }: { tracks: { id: string; label: string; steps: readonly Step[] }[] }) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [active, setActive] = useState(0);
  const uid = useId();
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const track = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const n = track.steps.length;
  const current = Math.min(active, n - 1);

  // The step crossing the middle of the screen is the current one.
  useEffect(() => {
    const els = stepRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-46% 0px -46% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [trackId]);

  return (
    <div className="w-full">
      {tracks.length > 1 ? (
        <div className="flex justify-center">
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
                }}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 ${t.id === trackId ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        id={`${uid}-panel`}
        role={tracks.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tracks.length > 1 ? `${uid}-tab-${trackId}` : undefined}
        className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start xl:gap-24"
      >
        {/* The ring: stays in view while the steps pass (large screens) */}
        <div className="sticky top-32 hidden lg:block" aria-hidden>
          <div className="relative aspect-square w-full">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-line)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-line)" strokeWidth="0.35" strokeDasharray="0.8 1.6" />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${((current + 1) / n) * 100} 100`}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray .7s var(--ease-out-quart)" }}
              />
              {track.steps.map((s, i) => {
                const a = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
                const reached = i <= current;
                return (
                  <circle
                    key={s.title}
                    cx={50 + 46 * Math.cos(a)}
                    cy={50 + 46 * Math.sin(a)}
                    r={i === current ? 2.2 : 1.4}
                    fill={reached ? "var(--color-gold)" : "#fff"}
                    stroke={reached ? "var(--color-gold)" : "var(--color-line)"}
                    strokeWidth="0.5"
                    style={{ transition: "r .4s var(--ease-out-quart), fill .4s, stroke .4s" }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[22%] text-center">
              <Image src="/images/mark.png" alt="" width={56} height={56} className="mb-4 h-11 w-11" />
              <p className="font-mono text-xs uppercase tracking-widest text-maroon">
                Step {current + 1} of {n}
              </p>
              <p key={`${trackId}-${current}`} className="quote-in mt-2 font-display text-[1.65rem] leading-tight">
                {track.steps[current]?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Every step, always readable */}
        <ol key={trackId} className="border-t border-line">
          {track.steps.map((s, i) => {
            const on = i === current;
            const reached = i <= current;
            return (
              <li
                key={s.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-step={i}
                className="relative grid grid-cols-[3.25rem_1fr] gap-5 border-b border-line py-8 lg:py-10"
              >
                <span aria-hidden className={`absolute -top-px left-0 h-0.5 w-full origin-left bg-gold transition-transform duration-700 ease-[var(--ease-out-quart)] ${on ? "scale-x-100" : "scale-x-0"}`} />
                <span
                  aria-hidden
                  className={`flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border font-mono text-sm transition-colors duration-300 ${
                    on ? "border-ink bg-ink text-gold" : reached ? "border-gold bg-gold text-ink" : "border-line bg-white text-ink"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-2">
                  <h3 className="font-display text-2xl md:text-[1.75rem]">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-muted">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
