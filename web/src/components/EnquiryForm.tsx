"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Tick } from "./ui";
import { IconArrow, IconDocument, IconUpload } from "./icons";
import { trackLead } from "@/lib/analytics";
import { services } from "@/content/company";

type Topic = "hire" | "register" | "general";

const TOPICS: { id: Topic; label: string }[] = [
  { id: "hire", label: "I'm hiring" },
  { id: "register", label: "I'm looking for a role" },
  { id: "general", label: "Something else" },
];

const MAX_MB = 5;
const CV_TYPES = ".pdf,.doc,.docx";

/**
 * Contact & application form. Posts multipart data to our own API route,
 * which validates it and forwards it to WordPress.
 */
export function EnquiryForm({
  mode,
  defaultTopic = "general",
  job,
  phone,
  phoneHref,
}: {
  mode: "contact" | "apply";
  defaultTopic?: Topic;
  job?: { slug: string; title: string };
  phone: string;
  phoneHref: string;
}) {
  const params = useSearchParams();
  const fromUrl = params.get("topic") as Topic | null;
  // "Enquire" links on the service cards carry ?service=<slug>; name it back to the
  // visitor so the form clearly continues the card they clicked, and send it with the enquiry.
  const service = services.find((s) => s.slug === params.get("service"));
  const [topic, setTopic] = useState<Topic>(
    mode === "apply" ? "register" : fromUrl && TOPICS.some((t) => t.id === fromUrl) ? fromUrl : defaultTopic,
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const showCv = mode === "apply" || topic === "register";

  // An error that stays on screen while you fix it reads as though the fix didn't count.
  const clearError = (k: string) =>
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });

  useEffect(() => {
    if (status === "sent") sentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);
  const showCompany = mode === "contact" && topic === "hire";

  function validate(fd: FormData) {
    const errs: Record<string, string> = {};
    if (!String(fd.get("name") ?? "").trim()) errs.name = "Enter your name.";
    const email = String(fd.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter an email address like name@company.com.";
    if (!String(fd.get("message") ?? "").trim() && mode === "contact") errs.message = "Tell us a little about what you need.";
    const cv = fd.get("cv");
    if (mode === "apply" && (!(cv instanceof File) || cv.size === 0)) errs.cv = "Attach your resume (PDF or Word).";
    if (cv instanceof File && cv.size > MAX_MB * 1024 * 1024) errs.cv = `Your file is larger than ${MAX_MB} MB. Attach a smaller file.`;
    if (!fd.get("consent")) errs.consent = "Confirm you agree so we can contact you.";
    return errs;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs = validate(fd);
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      (formRef.current?.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus();
      return;
    }
    fd.set("topic", topic);
    if (service && topic === "hire") fd.set("service", service.slug);
    if (job) {
      fd.set("jobSlug", job.slug);
      fd.set("jobTitle", job.title);
    }
    setStatus("sending");
    setError("");
    let res: Response;
    try {
      res = await fetch(mode === "apply" ? "/api/apply" : "/api/contact", { method: "POST", body: fd });
    } catch {
      // Network failure: never show the browser's raw error text.
      setStatus("error");
      setError("");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setStatus("sent");
      trackLead(mode === "apply" ? "application" : topic);
    } else {
      setStatus("error");
      setError(typeof data.error === "string" ? data.error : "");
    }
  }

  if (status === "sent") {
    return (
      <div ref={sentRef} role="status" className="rounded-xl border border-line bg-white p-8 md:p-10">
        <Tick animate className="h-10 w-12 text-accent" />
        <h2 className="mt-5 text-3xl">{mode === "apply" ? "Application sent" : "Message sent"}</h2>
        <p className="mt-3 text-muted">
          {mode === "apply"
            ? `Thank you. A recruiter will review your application${job ? ` for ${job.title}` : ""} and contact you, usually within two business days.`
            : "Thank you. We'll reply within one business day. If it's urgent, call us."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className="btn btn-ink">
            Browse more jobs
          </Link>
          <a href={`tel:${phoneHref}`} className="btn btn-ghost tabular-nums">
            {phone}
          </a>
        </div>
      </div>
    );
  }

  const err = (k: string) =>
    fieldErrors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-sm font-bold text-danger">
        {fieldErrors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({
    "aria-invalid": !!fieldErrors[k],
    "aria-describedby": fieldErrors[k] ? `${k}-error` : undefined,
    onInput: () => clearError(k),
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative rounded-xl border border-line bg-white p-6 md:p-10">
      {service && topic === "hire" && mode === "contact" ? (
        <p className="mb-6 rounded-lg border border-gold/40 bg-gold-soft/60 px-4 py-3 text-sm">
          <span className="font-bold">About: {service.title}.</span> <span className="text-muted">{service.lede}</span>
        </p>
      ) : null}

      {mode === "contact" ? (
        <fieldset>
          <legend className="label">What can we help with?</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <label
                key={t.id}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                  topic === t.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                }`}
              >
                <input type="radio" name="topicChoice" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} className="sr-only" />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className={`grid gap-5 sm:grid-cols-2 ${mode === "contact" ? "mt-8" : ""}`}>
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input id="name" name="name" autoComplete="name" className="field" {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="field" {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
        </div>
        {showCompany ? (
          <div>
            <label htmlFor="company" className="label">
              Company
            </label>
            <input id="company" name="company" autoComplete="organization" className="field" />
          </div>
        ) : (
          <div>
            <label htmlFor="linkedin" className="label">
              LinkedIn profile <span className="font-normal text-muted">(optional)</span>
            </label>
            <input id="linkedin" name="linkedin" type="url" inputMode="url" placeholder="https://linkedin.com/in/…" className="field" />
          </div>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="label">
          {mode === "apply" ? (
            <>
              Anything you&rsquo;d like us to know? <span className="font-normal text-muted">(optional)</span>
            </>
          ) : topic === "hire" ? (
            "Tell us about the role"
          ) : topic === "register" ? (
            "What kind of role are you looking for?"
          ) : (
            "Your message"
          )}
        </label>
        <textarea id="message" name="message" rows={5} className="field resize-y" {...a11y("message")} />
        {err("message")}
      </div>

      {showCv ? (
        <div className="mt-5">
          <p id="cv-label" className="label">
            Resume {mode === "contact" ? <span className="font-normal text-muted">(optional)</span> : null}
          </p>
          <ResumeDrop invalid={!!fieldErrors.cv} onPick={() => clearError("cv")} />
          {err("cv")}
        </div>
      ) : null}

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="consent" value="yes" className="check" {...a11y("consent")} onChange={() => clearError("consent")} />
          <span>
            I agree that Sharpe Wysman may store my details and contact me about this enquiry, as described in the{" "}
            <Link href="/privacy-policy" className="font-bold text-ink underline underline-offset-2">
              privacy policy
            </Link>
            . We never share your resume without your permission.
          </span>
        </label>
        {err("consent")}
      </div>

      {status === "error" ? (
        <div role="alert" className="mt-6 rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger-deep">
          {error || "Your message wasn't sent because of a connection problem."} Try again, or call us on{" "}
          <a href={`tel:${phoneHref}`} className="font-bold underline">
            {phone}
          </a>
          .
        </div>
      ) : null}

      <button type="submit" disabled={status === "sending"} className="btn btn-ink mt-8 w-full sm:w-auto disabled:opacity-60">
        {status === "sending" ? "Sending…" : mode === "apply" ? "Send application" : "Send message"}
        {status === "sending" ? null : <IconArrow />}
      </button>
    </form>
  );
}

/**
 * Custom resume drop zone. A real <input type="file"> stays in the form
 * (visually hidden, still keyboard-focusable), so it submits normally.
 */
function ResumeDrop({ invalid, onPick }: { invalid: boolean; onPick: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [over, setOver] = useState(false);

  const pick = (files: FileList | null) => {
    const f = files?.[0];
    setFile(f ? { name: f.name, size: f.size } : null);
    if (f) onPick();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (inputRef.current && e.dataTransfer.files.length) {
          inputRef.current.files = e.dataTransfer.files;
          pick(e.dataTransfer.files);
        }
      }}
      className={`relative rounded-xl border-[1.5px] border-dashed transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        over ? "border-ink bg-gold-soft" : invalid ? "border-danger bg-danger-soft/40" : "border-[#b9b7b1] bg-paper hover:border-ink"
      }`}
    >
      <input
        ref={inputRef}
        id="cv"
        name="cv"
        type="file"
        accept={CV_TYPES}
        aria-labelledby="cv-label"
        aria-describedby={invalid ? "cv-error cv-hint" : "cv-hint"}
        aria-invalid={invalid}
        onChange={(e) => pick(e.target.files)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      {file ? (
        <div className="pointer-events-none flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink text-gold">
            <IconDocument className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{file.name}</span>
            <span className="font-mono text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to send</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              setFile(null);
            }}
            className="pointer-events-auto relative z-10 rounded-full px-3 py-1.5 text-sm font-bold text-accent hover:bg-accent-soft"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="pointer-events-none flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-accent">
            <IconUpload className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-bold">
              Drop your resume here or <span className="text-accent underline underline-offset-2">browse</span>
            </span>
            <span id="cv-hint" className="text-sm text-muted">
              PDF or Word, up to {MAX_MB} MB
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
