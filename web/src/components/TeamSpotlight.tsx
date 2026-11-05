"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { TeamMember } from "@/lib/types";
import { Tick } from "./ui";
import { IconLinkedIn, IconMail, IconPhone } from "./icons";
import { telHref } from "./TeamGrid";

const ROTATE_MS = 6000;

/**
 * One person at a time, large: photo with a floating role badge, bio,
 * contact links, then an "experience" block built from their remaining
 * bio paragraphs and credentials. Auto-advances through the team (founder
 * first, in whatever order `team` arrives in) as soon as it's mounted; a
 * visible tab per person doubles as a manual switch and pauses the
 * rotation on hover/focus.
 */
export function TeamSpotlight({ team }: { team: TeamMember[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = !paused && team.length > 1;

  useEffect(() => {
    if (!running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % team.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [running, team.length]);

  const m = team[active];
  if (!m) return null;
  const experience = m.bio.slice(1);
  const hasExperience = experience.length > 0 || !!m.credentials?.length;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div key={m.slug} className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <div className="spotlight-in sheen relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2">
          {m.image ? (
            <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover object-top" />
          ) : null}
          <span className="absolute left-5 top-5 z-[2] rounded-full bg-white px-5 py-2.5 text-sm font-bold shadow-[0_8px_20px_-6px_rgb(30_29_31/0.25)]">
            {m.role}
          </span>
        </div>

        <div className="spotlight-in" style={{ ["--delay" as string]: "0.12s" }}>
          <h3 className="text-3xl md:text-[2.6rem]">{m.name}</h3>
          <p className="mt-6 text-lg leading-relaxed text-muted">{m.bio[0]}</p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold tabular-nums">
            {m.phone ? (
              <a href={telHref(m.phone)} className="icon-inline min-h-6 hover:text-maroon">
                <IconPhone className="h-4 w-4 text-maroon" />
                {m.phone}
              </a>
            ) : null}
            {m.email ? (
              <a href={`mailto:${m.email}`} className="icon-inline min-h-6 hover:text-maroon">
                <IconMail className="h-4 w-4 text-maroon" />
                Email
              </a>
            ) : null}
            {m.linkedin ? (
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="icon-inline min-h-6 hover:text-maroon">
                <IconLinkedIn className="h-4 w-4 text-maroon" />
                LinkedIn
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>

          {hasExperience ? (
            <div className="mt-10 border-t border-line pt-10">
              <h4 className="text-lg">{m.name} experience</h4>
              {experience.length ? (
                <div className="mt-4 space-y-4 text-muted">
                  {experience.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              ) : null}
              {m.credentials?.length ? (
                <ul className="mt-6 space-y-4">
                  {m.credentials.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <Tick className="mt-[0.3em] h-3.5 w-4 shrink-0 text-maroon" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {team.length > 1 ? (
        <div role="tablist" aria-label="Team member" className="mt-10 flex flex-wrap gap-2">
          {team.map((t, i) => (
            <button
              key={t.slug}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                i === active ? "border-ink bg-ink text-white" : "border-line text-muted hover:text-ink"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
