"use client";

import { useEffect, useRef, useState } from "react";

const SWAP_EVERY = 3300;
const DURATION = 540; // per-item transition duration
const COLS = 3; // must match the grid-cols-3 below
const ROW_STAGGER = 620; // delay step between rows: must clear DURATION so row 1 fully finishes before row 2 starts

/**
 * Verified official logo files, pulled from each firm's own site (or, for MNP,
 * Wikimedia Commons). Only companies with a confirmed, usable asset are listed
 * here; anything missing falls back to a quiet text wordmark rather than risk
 * showing the wrong company's mark.
 */
const CLIENT_LOGOS: Record<string, { src: string; width: number; height: number; invert?: boolean }> = {
  "Johnsen Archer": { src: "/images/clients/johnsen-archer.svg", width: 135, height: 61 },
  MNP: { src: "/images/clients/mnp.jpg", width: 250, height: 81 },
  "Renewal by Andersen": { src: "/images/clients/renewal-by-andersen.png", width: 1182, height: 455 },
  // This file is a white-on-transparent export (for use on a dark band); inverted it reads as a clean black mark here.
  "Baker Tilly WM": { src: "/images/clients/baker-tilly-wm.svg", width: 151, height: 40, invert: true },
};

function shuffledIndices(n: number, avoid?: number[]): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Re-rolling can land on the same arrangement as last time; nudge it so motion always reads.
  if (avoid && arr.length > 1 && arr.every((v, i) => v === avoid[i])) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

/**
 * A quiet grid of client marks that periodically reshuffles position: the
 * same slide/blur swap-cloud choreography, built with CSS transitions instead
 * of an animation library, to stay consistent with the rest of the site's
 * hand-rolled motion system (and to respect prefers-reduced-motion via the
 * same global media query the rest of the site relies on).
 */
export function LogoCloud({ items }: { items: string[] }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (items.length < 3) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The last row's transition starts (rows - 1) * ROW_STAGGER after the first
    // row, so it must be given that same head start before flipping phase,
    // otherwise the trailing row gets cut off mid-transition and snaps (the jerk).
    const rows = Math.ceil(items.length / COLS);
    const settle = DURATION + (rows - 1) * ROW_STAGGER;

    const id = window.setInterval(() => {
      setPhase("out");
      const t1 = window.setTimeout(() => {
        setOrder((prev) => shuffledIndices(items.length, prev));
        setPhase("in");
        const t2 = window.setTimeout(() => setPhase("idle"), settle);
        timers.current.push(t2);
      }, settle);
      timers.current.push(t1);
    }, SWAP_EVERY);

    return () => {
      window.clearInterval(id);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [items.length]);

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-10 md:gap-y-14">
      {order.map((itemIndex, slot) => {
        const name = items[itemIndex];
        const logo = CLIENT_LOGOS[name];
        return (
          <div key={slot} className="flex items-center justify-center px-5 py-2">
            <div
              className={`transition-[opacity,transform] ease-[var(--ease-out-quart)] ${
                phase === "out" ? "-translate-x-2 opacity-0" : "translate-x-0 opacity-100"
              }`}
              style={{ transitionDuration: `${DURATION}ms`, transitionDelay: `${Math.floor(slot / COLS) * ROW_STAGGER}ms` }}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- fixed-size static icon; next/image's responsive srcset swap mid-transition was the source of the visible glitch
                <img
                  src={logo.src}
                  alt={name}
                  width={logo.width}
                  height={logo.height}
                  className={`h-9 w-auto max-w-[9.5rem] object-contain grayscale transition-[filter] duration-300 hover:grayscale-0 sm:h-10 md:h-11 ${
                    logo.invert ? "invert" : ""
                  }`}
                />
              ) : (
                <span className="text-center font-serif text-base text-ink/70 transition hover:text-ink sm:text-lg md:text-xl">{name}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
