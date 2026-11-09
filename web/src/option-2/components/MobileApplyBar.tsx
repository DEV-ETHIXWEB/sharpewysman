"use client";

import { useEffect, useState } from "react";
import { IconArrow } from "./icons";

/**
 * Mobile-only sticky bar on job pages. Appears after the header has scrolled
 * away and hides while the application form itself is on screen.
 */
export function MobileApplyBar({ title, salary }: { title: string; salary?: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("job-hero");
    const form = document.getElementById("apply");
    if (!hero || !form) return;
    let heroGone = false;
    let formVisible = false;
    const update = () => setShow(heroGone && !formVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroGone = !e.isIntersecting;
        if (e.target === form) formVisible = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(form);
    return () => {
      io.disconnect();
      delete document.documentElement.dataset.applybar;
    };
  }, []);

  // Lets the assistant button move up while the bar is showing
  useEffect(() => {
    document.documentElement.dataset.applybar = show ? "true" : "false";
  }, [show]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white backdrop-blur transition-transform duration-500 ease-[var(--ease-out-quart)] lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-bold">{title}</p>
          {salary ? <p className="font-mono text-xs text-gold">{salary}</p> : null}
        </div>
        <a href="#apply" tabIndex={show ? 0 : -1} className="btn btn-gold !min-h-11 shrink-0 !px-5">
          Apply <IconArrow />
        </a>
      </div>
    </div>
  );
}
