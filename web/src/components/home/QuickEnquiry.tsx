"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { IconArrow } from "../icons";
import { Tick } from "../ui";

const DISMISS_KEY = "sw-quick-enquiry";
type Topic = "hire" | "register";

/**
 * Appears once the hero film settles.
 *  - Large screens: a dark glass enquiry card slides in on the right (the film glides aside).
 *  - Phones/tablets: a slim, dismissible prompt bar (no covering pop-up: Google penalises
 *    intrusive interstitials on mobile).
 * Never steals focus; dismissed or sent means it stays away for the rest of the visit.
 */
export function QuickEnquiry() {
  const [show, setShow] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const remembered = () => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setDesktop(mq.matches);
    const onMq = () => setDesktop(mq.matches);
    mq.addEventListener("change", onMq);
    const onSettled = () => {
      if (!remembered()) setShow(true);
    };
    window.addEventListener("sw:film-settled", onSettled);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("sw:film-settled", onSettled);
    };
  }, []);

  // Mobile bar only while the hero is on screen
  useEffect(() => {
    const el = sentinelRef.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Film docks aside while the desktop card is open
  useEffect(() => {
    if (show && desktop) window.dispatchEvent(new Event("sw:quick-open"));
    else window.dispatchEvent(new Event("sw:quick-close"));
  }, [show, desktop]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }, []);

  return (
    <>
      <div ref={sentinelRef} hidden />
      {show && desktop ? <EnquiryCard onClose={dismiss} /> : null}
      {show && !desktop && heroVisible ? <PromptBar onClose={dismiss} /> : null}
    </>
  );
}

/* ------------------------------------------------------------- desktop */

function EnquiryCard({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState<Topic>("hire");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const uid = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cardRef.current?.contains(document.activeElement)) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (!name) errs.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!fd.get("consent")) errs.consent = "Please confirm so we can reply.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    fd.set("topic", topic);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setFirstName(name.split(" ")[0]);
      setStatus("sent");
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {}
    } catch {
      setStatus("error");
    }
  }

  const field =
    "block w-full rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[0.95rem] text-white placeholder:text-white/40 transition focus:border-gold focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${uid}-title`}
      className="quick-card on-dark absolute right-[max(2rem,4vw)] top-[46%] z-10 2xl:top-1/2 w-[21rem] 2xl:w-[23rem] overflow-hidden rounded-2xl border border-white/10 bg-[#141315]/80 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur-xl"
    >
      <div className="h-[3px] bg-gold" aria-hidden />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close enquiry form"
        className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {status === "sent" ? (
        <div className="p-7" role="status">
          <Tick animate className="h-9 w-11 text-gold" />
          <p id={`${uid}-title`} className="mt-5 font-display text-2xl">
            Thank you{firstName ? `, ${firstName}` : ""}.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            A recruiter will reply personally within one business day. We&rsquo;ve also sent a confirmation to your inbox.
          </p>
          <button type="button" onClick={onClose} className="btn btn-ghost-light mt-6 !min-h-10 !px-5 text-sm">
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="relative p-7 pt-6">
          <p className="eyebrow text-gold">Start a conversation</p>
          <p id={`${uid}-title`} className="mt-2 pr-8 font-display text-[1.6rem] leading-tight">
            Tell us what you need.
          </p>
          <p className="mt-1.5 text-sm text-white/60">Confidential. A recruiter replies within one business day.</p>

          <div role="radiogroup" aria-label="I am" className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-white/15 p-1">
            {(
              [
                ["hire", "I'm hiring"],
                ["register", "I'm looking"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={topic === id}
                onClick={() => setTopic(id)}
                className={`rounded-full py-2 text-sm font-bold transition ${topic === id ? "bg-gold text-ink" : "text-white/70 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor={`${uid}-name`} className="sr-only">
                Full name
              </label>
              <input id={`${uid}-name`} name="name" autoComplete="name" placeholder="Full name" className={field} aria-invalid={!!errors.name} />
              {errors.name ? <p className="mt-1 text-xs font-bold text-[#ff9aa0]">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor={`${uid}-email`} className="sr-only">
                Email
              </label>
              <input id={`${uid}-email`} name="email" type="email" autoComplete="email" placeholder="Work email" className={field} aria-invalid={!!errors.email} />
              {errors.email ? <p className="mt-1 text-xs font-bold text-[#ff9aa0]">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor={`${uid}-msg`} className="sr-only">
                {topic === "hire" ? "The role you're hiring for" : "The role you're looking for"}
              </label>
              <input
                id={`${uid}-msg`}
                name="message"
                placeholder={topic === "hire" ? "The role you're hiring for" : "The role you're looking for"}
                className={field}
              />
            </div>
          </div>

          {/* Honeypot */}
          <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-white/60">
            <input type="checkbox" name="consent" value="yes" className="check check-dark !h-[1.1rem] !w-[1.1rem]" aria-invalid={!!errors.consent} />
            <span>
              Sharpe Wysman may contact me about this enquiry (
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-white">
                privacy policy
              </Link>
              ).
            </span>
          </label>
          {errors.consent ? <p className="mt-1 text-xs font-bold text-[#ff9aa0]">{errors.consent}</p> : null}

          {status === "error" ? (
            <p role="alert" className="mt-3 text-xs text-[#ff9aa0]">
              That didn&rsquo;t send. Please try again, or call us.
            </p>
          ) : null}

          <button type="submit" disabled={status === "sending"} className="btn btn-gold mt-5 w-full disabled:opacity-70">
            {status === "sending" ? "Sending…" : "Send"}
            {status === "sending" ? null : <IconArrow />}
          </button>
        </form>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- mobile */

function PromptBar({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="region"
      aria-label="Get in touch"
      className="quick-bar on-dark fixed bottom-4 left-4 right-[5.5rem] z-40 rounded-2xl border border-white/10 bg-ink/95 p-3 pl-4 text-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur md:bottom-6 md:left-6 md:right-auto md:w-[26rem]"
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-bold leading-snug">Hiring, or looking for a role?</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <Link href="/contact?topic=hire" className="rounded-full bg-gold py-2 text-center text-sm font-bold text-ink">
          I&rsquo;m hiring
        </Link>
        <Link href="/contact?topic=register" className="rounded-full border border-white/25 py-2 text-center text-sm font-bold">
          I&rsquo;m looking
        </Link>
      </div>
    </div>
  );
}
