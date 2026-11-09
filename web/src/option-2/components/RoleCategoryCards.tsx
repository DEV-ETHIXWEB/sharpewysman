"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Arrow } from "./ui";

type Category = { slug: string; name: string; roles: readonly string[] };

/**
 * "Roles we recruit for", as proper standing cards: every category is its
 * own bordered box, always visible. A single highlight outline lives behind
 * the grid and slides to whichever card is hovered or focused, measured
 * once per hover-enter and left to a CSS transition, no animation library.
 * Only an outline moves; each card's own fill and text never change colour.
 */
export function RoleCategoryCards({ categories }: { categories: Category[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{ i: number; x: number; y: number; w: number; h: number } | null>(null);

  const measure = (i: number, el: HTMLElement) => {
    const grid = gridRef.current;
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();
    setActive({ i, x: cardRect.left - gridRect.left, y: cardRect.top - gridRect.top, w: cardRect.width, h: cardRect.height });
  };

  return (
    <div
      ref={gridRef}
      onMouseLeave={() => setActive(null)}
      className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-2xl border-2 border-maroon transition-[transform,width,height,opacity] duration-300 ease-[var(--ease-out-quart)]"
        style={{
          opacity: active ? 1 : 0,
          transform: `translate(${(active?.x ?? 0) - 2}px, ${(active?.y ?? 0) - 2}px)`,
          width: active ? active.w + 4 : 0,
          height: active ? active.h + 4 : 0,
        }}
      />

      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={`/industries/${c.slug}`}
          data-reveal
          style={{ ["--i" as string]: i % 3 }}
          onMouseEnter={(e) => measure(i, e.currentTarget)}
          onFocus={(e) => measure(i, e.currentTarget)}
          className="group relative z-10 rounded-2xl border border-line bg-white p-7 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
        >
          <h3 className="flex items-center justify-between border-b border-line pb-3 text-2xl text-ink">
            {c.name}
            <Arrow className="h-4 w-4 transition duration-300 group-hover:translate-x-1 group-hover:text-maroon" />
          </h3>
          <ul className="mt-4 space-y-2 text-muted">
            {c.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Link>
      ))}
    </div>
  );
}
