import Image from "next/image";
import type { TeamMember } from "@/lib/types";
import { IconLinkedIn, IconMail, IconPhone } from "./icons";

/** North American numbers without a country code get +1. */
export function telHref(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `tel:+${d.length === 10 ? `1${d}` : d}`;
}

export function TeamGrid({ team, detailed = false }: { team: TeamMember[]; detailed?: boolean }) {
  return (
    <ul className={`grid gap-6 ${detailed ? "lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {team.map((m, i) => (
        <li key={m.slug} id={m.slug} data-reveal style={{ ["--i" as string]: i }} className={`overflow-hidden rounded-xl border border-line bg-white ${detailed ? "grid sm:grid-cols-[0.8fr_1.2fr]" : ""}`}>
          <div className={`relative bg-paper-2 ${detailed ? "aspect-[4/5] sm:aspect-auto sm:min-h-full" : "aspect-[4/4.2]"}`}>
            {m.image ? (
              <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
            ) : null}
          </div>
          <div className="p-6 md:p-8">
            <p className="eyebrow text-maroon">{m.role}</p>
            <h3 className="mt-2 text-[1.85rem]">{m.name}</h3>
            {detailed ? (
              <div className="mt-4 space-y-3 text-muted">
                {m.bio.map((p) => (
                  <p key={p.slice(0, 30)}>{p}</p>
                ))}
              </div>
            ) : null}
            {m.credentials?.length ? (
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {m.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold tabular-nums">
              {m.phone ? (
                <a href={telHref(m.phone)} className="icon-inline hover:text-maroon">
                  <IconPhone className="h-4 w-4 text-maroon" />
                  {m.phone}
                </a>
              ) : null}
              {m.email ? (
                <a href={`mailto:${m.email}`} className="icon-inline hover:text-maroon">
                  <IconMail className="h-4 w-4 text-maroon" />
                  Email
                </a>
              ) : null}
              {m.linkedin ? (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="icon-inline hover:text-maroon">
                  <IconLinkedIn className="h-4 w-4 text-maroon" />
                  LinkedIn
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
