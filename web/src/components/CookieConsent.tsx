"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readConsent, saveConsent, type Consent } from "@/lib/analytics";

const OPEN_EVENT = "sw:consent-open";

/**
 * Opt-in analytics consent (PIPEDA and Quebec Law 25). Rendered only when GA4 is configured.
 * Google Consent Mode starts as "denied" (see layout), so nothing is stored until the visitor accepts.
 * Non-modal: it never blocks reading or the enquiry forms.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const firstBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const reopen = () => {
      setOpen(true);
      requestAnimationFrame(() => firstBtn.current?.focus());
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (v: Consent) => {
    saveConsent(v);
    setOpen(false);
  };

  if (!open) return null;
  return (
    <section
      aria-label="Cookie preferences"
      className="consent-card on-dark fixed bottom-4 left-4 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-ink text-white shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
    >
      <div className="h-[3px] bg-gold" aria-hidden />
      <div className="p-5">
        <p className="font-display text-lg leading-snug">May we measure visits?</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          We&rsquo;d like to use Google Analytics cookies to see which pages help people most. No advertising, and nothing is set unless you
          agree. <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-gold">Privacy policy</Link>
        </p>
        <div className="mt-4 flex gap-2">
          <button ref={firstBtn} type="button" onClick={() => choose("granted")} className="btn btn-gold !min-h-10 flex-1 !px-4 text-sm">
            Accept
          </button>
          <button type="button" onClick={() => choose("denied")} className="btn btn-ghost-light !min-h-10 flex-1 !px-4 text-sm">
            Decline
          </button>
        </div>
      </div>
    </section>
  );
}

/** Footer link that reopens the preferences card. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}
