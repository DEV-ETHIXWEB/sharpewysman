"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArcMotif } from "../ui";

// The panel (engine + UI) loads only when first opened.
const ChatPanel = dynamic(() => import("./ChatPanel").then((m) => m.ChatPanel), { ssr: false });

const TEASER_KEY = "sw-assistant-teaser";

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // One gentle prompt per visit, after the visitor has had time to look around.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (seen) return;
    // Never alongside the hero's enquiry drawer: on the homepage, wait until the visitor has moved on from it.
    const inHero = () => !!document.querySelector(".quick-drawer") && window.scrollY < window.innerHeight * 0.6;
    const onScroll = () => {
      if (inHero()) return;
      window.removeEventListener("scroll", onScroll);
      setTeaser(true);
    };
    const t = window.setTimeout(() => {
      if (inHero()) window.addEventListener("scroll", onScroll, { passive: true });
      else setTeaser(true);
    }, 9000);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const dismissTeaser = useCallback(() => {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {}
  }, []);

  const toggle = () => {
    dismissTeaser();
    setMounted(true);
    setOpen((o) => !o);
  };

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  return (
    <>
      {mounted ? <ChatPanel open={open} onClose={close} /> : null}

      <div className="chat-launcher fixed bottom-5 right-5 z-[45] flex items-end gap-3 md:bottom-7 md:right-7">
        {teaser && !open ? (
          <div className="quote-in relative mb-2 hidden max-w-[16rem] rounded-2xl rounded-br-md border border-line bg-white px-4 py-3 text-sm shadow-xl shadow-ink/10 sm:block">
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Dismiss"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-muted hover:text-ink"
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <p className="font-bold text-ink">Hiring, or looking for a role?</p>
            <p className="mt-0.5 text-muted">Ask me about our jobs, fees or process. I answer instantly.</p>
          </div>
        ) : null}

        <button
          ref={btnRef}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="sw-assistant"
          aria-label={open ? "Close the Sharpe Wysman assistant" : "Open the Sharpe Wysman assistant"}
          className="group relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-ink text-gold shadow-[0_14px_40px_-12px_rgb(30_29_31/0.7)] ring-1 ring-white/10 transition duration-300 hover:scale-105 active:scale-95"
        >
          {/* gold halo */}
          <span className="absolute inset-0 rounded-full ring-2 ring-gold/0 transition duration-500 group-hover:ring-gold/60" aria-hidden />
          <span className={`absolute transition-all duration-500 ease-[var(--ease-out-quart)] ${open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`} aria-hidden>
            <ArcMotif className="h-8 w-8 transition-transform duration-700 group-hover:-rotate-45" />
          </span>
          <span className={`absolute transition-all duration-500 ease-[var(--ease-out-quart)] ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`} aria-hidden>
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          {teaser && !open ? <span className="live-dot absolute right-1 top-1 h-3 w-3 border-2 border-ink text-gold" aria-hidden /> : null}
        </button>
      </div>
    </>
  );
}
