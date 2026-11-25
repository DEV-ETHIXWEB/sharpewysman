"use client";

import { useId } from "react";
import type { Faq } from "@/lib/types";
import { IconPlus } from "./icons";

/**
 * Native <details> accordion: fully accessible, mutually exclusive via the
 * shared `name` (the browser enforces this even when `open` is set from JS,
 * so hover-to-open still closes whichever sibling was open). `useId` keeps
 * each rendered FaqList its own group, so two on one page never cross.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const groupName = useId();
  return (
    <div data-reveal className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details
          key={f.id}
          name={groupName}
          className="group py-1"
          onPointerEnter={(e) => {
            // Mouse only: a tap also fires "enter" right before its click, which
            // would open the answer and then immediately toggle it shut.
            if (e.pointerType !== "mouse" || e.currentTarget.open) return;
            e.currentTarget.open = true;
            // The click that usually follows a hover means "open", so it mustn't toggle it shut.
            e.currentTarget.dataset.hoverOpened = "";
          }}
          onPointerLeave={(e) => {
            delete e.currentTarget.dataset.hoverOpened;
          }}
        >
          <summary
            className="flex items-start justify-between gap-6 py-5 text-left"
            onClick={(e) => {
              const d = e.currentTarget.parentElement as HTMLDetailsElement;
              if (d.dataset.hoverOpened === undefined) return;
              e.preventDefault();
              delete d.dataset.hoverOpened;
            }}
          >
            <h3 className="font-display text-xl leading-snug md:text-2xl">{f.question}</h3>
            <span
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line transition duration-300 group-hover:border-ink group-open:rotate-[135deg] group-open:border-ink group-open:bg-ink group-open:text-gold"
              aria-hidden
            >
              <IconPlus className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 pr-12 text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
