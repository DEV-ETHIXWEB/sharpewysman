"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a figure up from zero when it scrolls into view ("600+", "18", "100%").
 * Server HTML always contains the final value (SEO, no-JS, reduced motion).
 */
export function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const m = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const target = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m || Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already visible: don't flash
    const [pre, , post] = [m[1], m[2], m[3]];
    setShown(`${pre}0${post}`);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setShown(`${pre}${Math.round(target * eased).toLocaleString("en-CA")}${post}`);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
