"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { IconArrow } from "../icons";
import { Tick } from "../ui";
import { trackLead } from "@/lib/analytics";

const SEEN_KEY = "sw-quick-drawer";
type Topic = "hire" | "register";

/**
 * Pull-tab enquiry drawer on the right edge of the screen.
 *  - A gold tab ("Start a conversation") is always attached to the edge.
 *  - When the hero film settles, the drawer slides out once per visit on larger screens.
 *    On phones it only nudges the tab (no auto-opening overlay: Google penalises
 *    intrusive interstitials on mobile).
 *  - Click/tap the tab to pull it open or push it closed; Escape closes it.
 *  - Closed panel is inert, so keyboard users never tab into hidden fields.
 */
export function QuickEnquiry() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [inHero, setInHero] = useState(true);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const uid = useId();
  const tabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSettled = () => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      if (seen) return;
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(true);
      else {
        setNudge(true);
        window.setTimeout(() => setNudge(false), 2400);
      }
    };
    window.addEventListener("sw:film-settled", onSettled);
    return () => window.removeEventListener("sw:film-settled", onSettled);
  }, []);

  // The tab belongs to the hero: it slides away (and the drawer closes) once the hero is scrolled past,
  // so it never sits over body copy further down the page.
  useEffect(() => {
    const hero = sentinelRef.current?.closest("section");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInHero(e.isIntersecting);
        if (!e.isIntersecting) setOpen(false);
      },
      { threshold: 0.2 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (panelRef.current?.contains(document.activeElement)) tabRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
    <span ref={sentinelRef} hidden />
    <div
      aria-hidden={!inHero || undefined}
      className={`quick-drawer fixed right-0 top-1/2 z-40 flex items-center ${open ? "is-open" : ""} ${nudge ? "is-nudging" : ""} ${inHero ? "" : "is-away"}`}
    >
      {/* Pull tab */}
      <button
        ref={tabRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        tabIndex={inHero ? 0 : -1}
        className="drawer-tab group relative flex flex-col items-center gap-3 rounded-l-2xl bg-gold px-2.5 py-5 text-ink shadow-[-12px_0_30px_-12px_rgb(0_0_0/0.6)] transition-colors hover:bg-[#ffdb4d]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-gold transition-transform duration-500 group-hover:scale-110">
          <IconArrow className={`h-3.5 w-3.5 transition-transform duration-500 ${open ? "" : "rotate-180"}`} strokeWidth={2} />
        </span>
        <span aria-hidden className="rotate-180 text-[0.8rem] font-bold tracking-wide [writing-mode:vertical-rl]">
          {open ? "Close" : "Start a conversation"}
        </span>
        <span className="sr-only">{open ? "Close the enquiry form" : "Open the enquiry form"}</span>
      </button>

      {/* Panel */}
      <div
        id={`${uid}-panel`}
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${uid}-title`}
        inert={!open}
        className="on-dark relative w-[min(23rem,calc(100vw-3.5rem))] overflow-hidden rounded-l-2xl border border-r-0 border-white/10 bg-[#141315]/90 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur-xl"
      >
        <div className="h-[3px] bg-gold" aria-hidden />
        <DrawerForm titleId={`${uid}-title`} onDone={close} />
      </div>
    </div>
    </>
  );
}

/* ---------------------------------------------------------------- form */

function DrawerForm({ titleId, onDone }: { titleId: string; onDone: () => void }) {
  const [topic, setTopic] = useState<Topic>("hire");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const [serverError, setServerError] = useState("");
  const uid = useId();

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
    setServerError("");
    let res: Response;
    try {
      res = await fetch("/api/contact", { method: "POST", body: fd });
    } catch {
      setStatus("error");
      return;
    }
    if (res.ok) {
      setFirstName(name.split(" ")[0]);
      setStatus("sent");
      trackLead(topic);
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setServerError(typeof data.error === "string" ? data.error : "");
    setStatus("error");
  }

  const field =
    "block w-full rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[0.95rem] text-white placeholder:text-white/40 transition focus:border-gold focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-gold/30";

  if (status === "sent") {
    return (
      <div className="p-7" role="status">
        <Tick animate className="h-9 w-11 text-gold" />
        <p id={titleId} className="mt-5 font-display text-2xl">
          Thank you{firstName ? `, ${firstName}` : ""}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          A recruiter will reply personally within one business day. We&rsquo;ve also sent a confirmation to your inbox.
        </p>
        <button type="button" onClick={onDone} className="btn btn-ghost-light mt-6 !min-h-10 !px-5 text-sm">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative p-7 pt-6">
      <p className="eyebrow text-gold">Start a conversation</p>
      <p id={titleId} className="mt-2 font-display text-[1.6rem] leading-tight">
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
          <input id={`${uid}-msg`} name="message" placeholder={topic === "hire" ? "The role you're hiring for" : "The role you're looking for"} className={field} />
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
          {serverError || "That didn\u2019t send because of a connection problem."} Please try again, or call us.
        </p>
      ) : null}

      <button type="submit" disabled={status === "sending"} className="btn btn-gold mt-5 w-full disabled:opacity-70">
        {status === "sending" ? "Sending…" : "Send"}
        {status === "sending" ? null : <IconArrow />}
      </button>
    </form>
  );
}
