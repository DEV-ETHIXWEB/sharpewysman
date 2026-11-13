"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { IconArrow } from "../icons";
import { Tick } from "../ui";
import { trackLead } from "@/lib/analytics";

type Topic = "hire" | "register";

/**
 * Inline enquiry card for the hero's right-hand column: "Start a conversation",
 * always visible beside the hero copy rather than tucked in a pull-out drawer.
 */
export function EnquiryForm({ className = "" }: { className?: string }) {
  const [topic, setTopic] = useState<Topic>("hire");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
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
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch("/api/contact", { method: "POST", body: fd });
    } catch {
      setStatus("error");
      return;
    }
    // A brief, deliberate minimum so the loading state reads as a considered pause, not a flash.
    const rest = 550 - (Date.now() - started);
    if (rest > 0) await new Promise((r) => setTimeout(r, rest));
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
      <div className={`rise p-7 ${className}`} role="status">
        <Tick animate className="h-9 w-11 text-gold" />
        <p className="mt-5 font-display text-2xl">Thank you{firstName ? `, ${firstName}` : ""}.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          A recruiter will reply personally within one business day. We&rsquo;ve also sent a confirmation to your inbox.
        </p>
        <button
          type="button"
          onClick={() => {
            formRef.current?.reset();
            setErrors({});
            setServerError("");
            setStatus("idle");
          }}
          className="btn btn-ghost-light mt-6 !min-h-10 !px-5 text-sm"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className={`relative p-7 ${className}`}>
      <p className="eyebrow text-gold">Start a conversation</p>
      <p className="mt-2 font-display text-[1.6rem] leading-tight">Tell us what you need.</p>
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
          {serverError || "That didn’t send because of a connection problem."} Please try again, or call us.
        </p>
      ) : null}

      <button type="submit" disabled={status === "sending"} className="btn btn-gold mt-5 w-full disabled:opacity-90">
        {status === "sending" ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send <IconArrow />
          </>
        )}
      </button>
    </form>
  );
}
