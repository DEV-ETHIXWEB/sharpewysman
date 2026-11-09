"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Arrow, TickList } from "../ui";
import { IconChevronDown } from "../icons";

type Audience = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  href: string;
  cta: string;
  image: string;
};

/**
 * One of the two "For employers" / "For candidates" homepage cards. Collapsed
 * by default to a short teaser so the pair doesn't run the section tall on
 * scroll; the body and point list expand in place behind "Read more".
 */
export function AudienceCard({ data, index }: { data: Audience; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      data-reveal
      style={{ ["--i" as string]: index }}
      className="audience-card group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10"
    >
      <div className="audience-image relative aspect-[21/9] overflow-hidden">
        <Image src={data.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="parallax-img object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="audience-body flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow text-maroon">{data.eyebrow}</p>
        <h3 className="mt-2 text-2xl md:text-[1.9rem]">{data.title}</h3>
        <p className={`audience-teaser mt-3 text-muted ${open ? "" : "line-clamp-2"}`}>{data.body}</p>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="audience-toggle relative z-10 mt-3 flex min-h-6 items-center gap-1.5 self-start text-sm font-bold text-ink/60 transition hover:text-maroon"
        >
          {open ? "Show less" : "Read more"}
          <IconChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </button>

        <div
          className={`audience-collapse grid transition-[grid-template-rows,opacity] duration-400 ease-[var(--ease-out-quart)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <TickList items={data.points} className="mt-4" />
          </div>
        </div>

        <Link href={data.href} className="link-arrow mt-6 self-start after:absolute after:inset-0">
          {data.cta} <Arrow />
        </Link>
      </div>
    </article>
  );
}
