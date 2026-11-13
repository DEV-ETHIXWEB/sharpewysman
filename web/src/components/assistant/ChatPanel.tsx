"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AssistantEngine } from "@/lib/assistant/engine";
import { emptyCtx, type AssistantKB, type Block, type Ctx, type Reply } from "@/lib/assistant/types";
import { IconArrow, IconPin, IconSalary } from "../icons";
import { Tick } from "../ui";
import { PoweredBy } from "../PoweredBy";

type Msg = { id: string; from: "bot" | "user"; reply?: Reply; text?: string; streamed?: boolean };

const STORE = "sw-assistant-v1";
const WELCOME: Reply = {
  blocks: [
    {
      kind: "text",
      text: "Hello, I'm the Sharpe Wysman assistant. I can help you explore our current roles, explain how we work with employers and candidates, or put you in touch with a recruiter.",
    },
  ],
  chips: ["Show me current jobs", "I'm hiring", "Is it free for candidates?", "How does it work?"],
};

let idSeq = 0;
const uid = () => `${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kb, setKb] = useState<AssistantKB | null>(null);
  const [failed, setFailed] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ctx, setCtx] = useState<Ctx>(emptyCtx());
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [reduced, setReduced] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const engine = useMemo(() => (kb ? new AssistantEngine(kb) : null), [kb]);

  // Load knowledge + restore the conversation for this visit
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    fetch("/api/assistant")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: AssistantKB) => setKb(d))
      .catch(() => setFailed(true));
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "null");
      if (saved?.msgs?.length) {
        setMsgs(saved.msgs.map((m: Msg) => ({ ...m, streamed: true })));
        setCtx(saved.ctx ?? emptyCtx());
        return;
      }
    } catch {}
    setMsgs([{ id: uid(), from: "bot", reply: WELCOME }]);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.slice(-40), ctx }));
    } catch {}
  }, [msgs, ctx]);

  // Focus + keyboard
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Lock page scroll behind the full-screen sheet on phones
  useEffect(() => {
    if (!open || window.innerWidth >= 640) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const scrollDown = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  useEffect(scrollDown, [msgs.length, typing, scrollDown]);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, 300);
      if (!text || typing) return;
      setInput("");
      setMsgs((m) => [...m, { id: uid(), from: "user", text }]);
      if (!engine) {
        setMsgs((m) => [
          ...m,
          {
            id: uid(),
            from: "bot",
            reply: { blocks: [{ kind: "text", text: failed ? "I can't load my knowledge right now. Please call us or send a message and a recruiter will help." : "One moment, I'm just getting ready. Please try again in a second." }] },
          },
        ]);
        return;
      }
      const { reply, ctx: next } = engine.respond(text, ctx);
      setCtx(next);
      setTyping(true);
      // A natural pause: longer for longer answers, never sluggish.
      const words = reply.blocks.reduce((n, b) => n + (b.kind === "text" ? b.text.split(" ").length : 6), 0);
      const delay = reduced ? 0 : Math.min(1100, 380 + words * 14);
      window.setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, { id: uid(), from: "bot", reply, streamed: reduced }]);
      }, delay);
    },
    [engine, ctx, typing, failed, reduced],
  );

  const restart = () => {
    setCtx(emptyCtx());
    setMsgs([{ id: uid(), from: "bot", reply: WELCOME }]);
    inputRef.current?.focus();
  };

  const lastBot = [...msgs].reverse().find((m) => m.from === "bot");
  const markDone = (id: string) => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, streamed: true } : x)));
  const closeOnMobile = () => {
    if (window.innerWidth < 640) onClose();
  };

  return (
    <div
      id="sw-assistant"
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="sw-assistant-title"
      hidden={!open}
      className="chat-panel fixed inset-0 z-[55] flex flex-col overflow-hidden bg-paper sm:inset-auto sm:bottom-[6.5rem] sm:right-5 sm:h-[min(42rem,calc(100dvh-8.5rem))] sm:w-[25rem] sm:rounded-2xl sm:border sm:border-line sm:shadow-[0_40px_90px_-30px_rgb(30_29_31/0.55)] md:right-7"
    >
      {/* Header */}
      <div className="on-dark relative flex items-center gap-3 overflow-hidden bg-ink px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 text-gold/[0.08]" aria-hidden>
          <svg viewBox="0 0 400 400" className="spin-slow h-full w-full" fill="none" stroke="currentColor">
            <path d="M330 70A170 170 0 1 0 330 330" strokeWidth="38" strokeLinecap="round" />
            <path d="M300 125A110 110 0 1 0 300 275" strokeWidth="26" strokeLinecap="round" />
          </svg>
        </div>
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-gold/40">
          <Image src="/images/mark.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink bg-[#3fae5f]" aria-hidden />
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 id="sw-assistant-title" className="font-display text-xl leading-tight">
            Sharpe Assistant
          </h2>
          <p className="truncate text-xs text-muted-dark">Automated guide · instant answers</p>
        </div>
        <button type="button" onClick={restart} className="relative rounded-full px-2.5 py-1.5 text-xs font-bold text-muted-dark transition hover:bg-white/5 hover:text-gold">
          Restart
        </button>
        <button type="button" onClick={onClose} aria-label="Close assistant" className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="h-[3px] bg-gold" aria-hidden />

      {/* Conversation */}
      <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions" className="ledger-ruled flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 [background-size:100%_2.75rem]">
        {msgs.map((m) =>
          m.from === "user" ? (
            <div key={m.id} className="chat-in flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[0.95rem] leading-relaxed text-white shadow-sm">
                {m.text}
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] uppercase tracking-widest text-gold/80">
                  <Tick className="h-2 w-2.5" /> Sent
                </span>
              </div>
            </div>
          ) : (
            <BotMessage
              key={m.id}
              msg={m}
              reduced={reduced}
              onDone={() => markDone(m.id)}
              onProgress={scrollDown}
              onChip={send}
              showChips={m.id === lastBot?.id && !typing}
              onNavigate={closeOnMobile}
            />
          ),
        )}
        {typing ? (
          <div className="chat-in flex items-end gap-2.5" aria-label="Assistant is typing">
            <Avatar />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3.5 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: `${i * 0.16}s` }} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper px-3 py-2 transition focus-within:border-ink focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgb(253_199_5/0.45)]">
          <label htmlFor="sw-assistant-input" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="sw-assistant-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={300}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about jobs, fees, our process…"
            className="max-h-28 min-h-[2.25rem] flex-1 resize-none bg-transparent py-1.5 text-[0.95rem] text-ink outline-none placeholder:text-muted/80"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.14)] transition hover:bg-[#ffdb4d] disabled:bg-line disabled:text-muted disabled:shadow-none"
          >
            <IconArrow className="h-4 w-4 -rotate-90" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[11px] text-muted">
          Automated assistant. Please don&rsquo;t share sensitive personal details.{" "}
          <Link href="/contact" onClick={closeOnMobile} className="font-bold text-ink underline underline-offset-2">
            Talk to a recruiter
          </Link>
        </p>
        <div className="mt-2.5 flex justify-center border-t border-line pt-2.5">
          <PoweredBy tone="dark" size="sm" />
        </div>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- parts */

function Avatar() {
  return (
    <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink ring-1 ring-gold/40">
      <Image src="/images/mark.png" alt="" width={18} height={18} className="h-[1.1rem] w-[1.1rem]" />
    </span>
  );
}

function BotMessage({
  msg,
  reduced,
  onDone,
  onProgress,
  onChip,
  showChips,
  onNavigate,
}: {
  msg: Msg;
  reduced: boolean;
  onDone: () => void;
  onProgress: () => void;
  onChip: (t: string) => void;
  showChips: boolean;
  onNavigate: () => void;
}) {
  const blocks = msg.reply?.blocks ?? [];
  const texts = blocks.filter((b): b is Extract<Block, { kind: "text" }> => b.kind === "text");
  const fullWords = texts.map((t) => t.text.split(" "));
  const total = fullWords.reduce((n, w) => n + w.length, 0);
  const [shown, setShown] = useState(msg.streamed || reduced ? total : 0);
  const done = shown >= total;

  // Stream words like a writer thinking aloud
  useEffect(() => {
    if (done) {
      if (!msg.streamed) onDone();
      return;
    }
    const step = total > 60 ? 3 : 2;
    const t = window.setTimeout(() => {
      setShown((s) => Math.min(total, s + step));
      onProgress();
    }, 32);
    return () => window.clearTimeout(t);
  }, [shown, done, total, msg.streamed, onDone, onProgress]);

  let budget = shown;
  let textIndex = 0;
  return (
    <div className="chat-in flex items-end gap-2.5">
      <Avatar />
      <div className="min-w-0 max-w-[88%] space-y-2.5">
        {blocks.map((b, i) => {
          if (b.kind === "text") {
            const words = fullWords[textIndex++];
            const n = Math.max(0, Math.min(words.length, budget));
            budget -= words.length;
            if (n === 0) return null;
            return (
              <div key={i} className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-[0.95rem] leading-relaxed text-ink shadow-sm">
                <RichText text={words.slice(0, n).join(" ")} />
                {n < words.length ? <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent" aria-hidden /> : null}
              </div>
            );
          }
          if (!done) return null;
          return (
            <div key={i} className="chat-in" style={{ animationDelay: `${i * 70}ms` }}>
              <RichBlock block={b} onNavigate={onNavigate} />
            </div>
          );
        })}
        {done && showChips && msg.reply?.chips?.length ? (
          <div className="chat-in flex flex-wrap gap-2 pt-1" style={{ animationDelay: "120ms" }}>
            {msg.reply.chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChip(c)}
                className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-[0.8rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-gold"
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  // Minimal, safe markdown: **bold** only (no HTML injection possible)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-bold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function SmartLink({ href, children, className, onNavigate }: { href: string; children: ReactNode; className: string; onNavigate: () => void }) {
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function RichBlock({ block, onNavigate }: { block: Block; onNavigate: () => void }) {
  switch (block.kind) {
    case "jobs":
      return (
        <ul className="space-y-2">
          {block.jobs.map((j) => {
            const sal = j.salaryMin ? `$${Math.round(j.salaryMin / 1000)}k${j.salaryMax ? ` to $${Math.round(j.salaryMax / 1000)}k` : ""}` : null;
            return (
              <li key={j.slug}>
                <SmartLink
                  href={`/jobs/${j.slug}`}
                  onNavigate={onNavigate}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.05rem] leading-snug text-ink group-hover:text-accent">{j.title}</span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                      <span className="icon-inline !gap-1">
                        <IconPin className="h-3 w-3 text-accent" />
                        {j.location}
                      </span>
                      {sal ? (
                        <span className="icon-inline !gap-1 font-bold text-ink">
                          <IconSalary className="h-3 w-3 text-accent" />
                          {sal}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition group-hover:bg-ink group-hover:text-gold">
                    <IconArrow className="h-3.5 w-3.5" />
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
          {block.steps.map((s, i) => (
            <li key={s.title} className="flex gap-3 text-[0.9rem] leading-snug">
              {s.body ? (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold font-mono text-[10px] text-gold-ink">{i + 1}</span>
              ) : (
                <Tick className="mt-1 h-3 w-3.5 shrink-0 text-accent" />
              )}
              <span>
                <span className="font-bold text-ink">{s.title}</span>
                {s.body ? <span className="block text-muted">{s.body}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      );
    case "actions":
      return (
        <div className="flex flex-wrap gap-2">
          {block.actions.map((a) => (
            <SmartLink
              key={a.label}
              href={a.href}
              onNavigate={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-bold transition ${
                a.primary ? "bg-gold text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb4d]" : "border border-ink/20 bg-white text-ink hover:border-ink"
              }`}
            >
              {a.label}
              <IconArrow className="h-3.5 w-3.5" />
            </SmartLink>
          ))}
        </div>
      );
    case "quote":
      return (
        <figure className="rounded-2xl border-l-[3px] border-gold bg-white p-4 shadow-sm">
          <blockquote className="font-serif text-[0.98rem] leading-relaxed text-ink">&ldquo;{block.quote}&rdquo;</blockquote>
          <figcaption className="mt-2 text-xs font-bold text-muted">{block.by}</figcaption>
        </figure>
      );
    default:
      return null;
  }
}
