"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Industry } from "@/lib/types";
import { Arrow } from "./ui";

const CARD_H = 440;

/**
 * Home-page teaser: a dark, horizontally-scrolling row of industries.
 * Accounting & Finance (the firm's specialism) leads as a solid card with
 * its own pitch and CTA; the rest are image cards, name bottom-left.
 * Arrow buttons sit below the row, bottom-right; the row itself also
 * scrolls by touch/trackpad and snaps per card.
 */
export function IndustryCarousel({ industries, openByIndustry }: { industries: Industry[]; openByIndustry: Record<string, number> }) {
  const [primary, ...rest] = [...industries].sort((a, b) => Number(b.primary) - Number(a.primary) || a.order - b.order);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [industries.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.clientWidth ?? 280) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pl-5 pr-5 md:pl-[max(2rem,calc((100vw-78rem)/2+2rem))] md:pr-8"
      >
        {primary ? (
          <Link
            href={`/industries/${primary.slug}`}
            data-reveal="fade"
            style={{ height: CARD_H }}
            className="group flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl bg-accent p-7 text-white sm:w-[320px] md:w-[340px] md:p-9"
          >
            <div>
              <p className="eyebrow text-gold">Our specialty</p>
              <h3 className="font-display mt-4 text-3xl leading-tight md:text-4xl">{primary.name}</h3>
              <p className="mt-4 text-white/80">{primary.tagline}</p>
            </div>
            <span className="btn btn-gold self-start">
              Explore more <Arrow />
            </span>
          </Link>
        ) : null}

        {rest.map((ind) => (
          <Link
            key={ind.slug}
            href={`/industries/${ind.slug}`}
            data-reveal="fade"
            style={{ height: CARD_H }}
            className="group relative flex w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[260px] md:w-[280px]"
          >
            <Image
              src={ind.image}
              alt=""
              fill
              sizes="(min-width: 768px) 280px, 260px"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="relative z-10 mt-auto flex w-full flex-col gap-1 p-5">
              <span className="font-display text-xl text-white">{ind.name}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                {openByIndustry[ind.slug] ? `${openByIndustry[ind.slug]} open roles` : "Register interest"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 px-5 md:px-8">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          aria-label="Previous industry"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition duration-300 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/25 disabled:hover:text-white"
        >
          <Arrow className="h-4 w-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          aria-label="Next industry"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition duration-300 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/25 disabled:hover:text-white"
        >
          <Arrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
