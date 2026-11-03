import type { Faq } from "@/lib/types";
import { IconPlus } from "./icons";

/** Native <details> accordion: works without JavaScript and is fully accessible. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div data-reveal className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.id} className="group py-1">
          <summary className="flex items-start justify-between gap-6 py-5 text-left">
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
