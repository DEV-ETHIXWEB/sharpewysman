"use client";

import { useRef, type ReactNode } from "react";

/**
 * A soft highlight that glides between the main navigation items. One element, measured
 * once per item entered and moved by a CSS transition; on first entry it appears in place
 * rather than sliding in from the side.
 */
export function NavGlide({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(false);

  const moveTo = (target: EventTarget | null) => {
    const wrap = wrapRef.current;
    const pill = pillRef.current;
    const list = wrap?.querySelector("ul");
    if (!wrap || !pill || !list || !(target instanceof Node)) return;
    const item = Array.from(list.children).find((li) => li.contains(target));
    const link = item?.querySelector("a");
    if (!link) return;
    const w = wrap.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    if (!shown.current) {
      pill.style.transition = "none";
      pill.style.transform = `translateX(${r.left - w.left}px)`;
      pill.style.width = `${r.width}px`;
      void pill.offsetWidth;
      pill.style.transition = "";
      shown.current = true;
    }
    pill.style.transform = `translateX(${r.left - w.left}px)`;
    pill.style.width = `${r.width}px`;
    pill.style.opacity = "1";
  };

  const hide = () => {
    shown.current = false;
    if (pillRef.current) pillRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerOver={(e) => e.pointerType === "mouse" && moveTo(e.target)}
      onPointerLeave={hide}
      onFocusCapture={(e) => e.target.matches(":focus-visible") && moveTo(e.target)}
      onBlurCapture={hide}
    >
      <span ref={pillRef} aria-hidden className="nav-glide" />
      {children}
    </div>
  );
}
