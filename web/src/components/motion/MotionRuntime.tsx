"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * One lightweight runtime for site-wide motion:
 *  - reveals [data-reveal] elements as they scroll into view
 *  - feeds cursor position to [data-glow] cards
 *  - marks the page as scrolled (header shadow) and drives the reading-progress bar
 * Re-scans on every route change.
 */
export function MotionRuntime() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll reveals
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    // Content rendered later (tab switches, filters) is picked up too.
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const found = [node, ...Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]"))].filter(
            (el) => el.matches("[data-reveal]:not(.is-in)"),
          );
          found.forEach((el) => io.observe(el));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // Cursor glow, header state and progress bar
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        root.dataset.scrolled = y > 8 ? "true" : "false";
        const max = root.scrollHeight - window.innerHeight;
        if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      });
    };
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Recalculate progress after navigation, and fade the new page in (never on first load).
  const firstRoute = useRef(true);
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.getElementById("main")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={barRef} className="h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
