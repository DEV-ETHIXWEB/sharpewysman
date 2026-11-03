import Image from "next/image";
import Link from "next/link";
import type { Industry } from "@/lib/types";
import { Arrow } from "./ui";
import { INDUSTRY_ICONS, IconLedger } from "./icons";

/** Accounting & Finance gets the large tile; it is the firm's specialism. */
export function IndustryGrid({ industries, openByIndustry }: { industries: Industry[]; openByIndustry: Record<string, number> }) {
  const [primary, ...rest] = [...industries].sort((a, b) => Number(b.primary) - Number(a.primary) || a.order - b.order);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      {primary ? (
        <Link
          href={`/industries/${primary.slug}`}
          data-reveal
          className="on-dark group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-xl bg-ink p-7 text-white md:col-span-2 lg:row-span-2 lg:min-h-[32rem] lg:p-10"
        >
          <Image
            src={primary.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="parallax-img -z-10 object-cover opacity-45 transition duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
          <span className="mb-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
            <IconLedger className="h-7 w-7" />
          </span>
          <p className="eyebrow mt-10 text-gold">Our specialty</p>
          <h3 className="mt-3 text-4xl md:text-5xl">{primary.name}</h3>
          <p className="mt-4 max-w-md text-white/80">{primary.tagline}</p>
          <p className="mt-6 flex items-center gap-3 font-mono text-sm text-gold">
            {openByIndustry[primary.slug] ?? 0} open roles <Arrow className="h-4 w-4 transition group-hover:translate-x-1" />
          </p>
        </Link>
      ) : null}
      {rest.map((ind, i) => {
        const Icon = INDUSTRY_ICONS[ind.slug];
        return (
        <Link
          key={ind.slug}
          href={`/industries/${ind.slug}`}
          data-reveal
          data-glow
          style={{ ["--i" as string]: i + 1, ["--glow" as string]: "rgb(128 25 33 / 0.06)" }}
          className="group flex min-h-[15rem] flex-col justify-between rounded-xl border border-line bg-white p-7 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-lg hover:shadow-ink/5"
        >
          <div>
            {Icon ? (
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-paper text-maroon transition duration-300 group-hover:bg-ink group-hover:text-gold">
                <Icon className="h-6 w-6" />
              </span>
            ) : null}
            <h3 className="text-[1.75rem] group-hover:text-maroon">{ind.name}</h3>
            <p className="mt-3 text-[0.95rem] text-muted">{ind.tagline}</p>
          </div>
          <p className="mt-6 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
            {openByIndustry[ind.slug] ? `${openByIndustry[ind.slug]} open roles` : "Register interest"}
            <Arrow className="h-4 w-4 text-ink transition group-hover:translate-x-1" />
          </p>
        </Link>
        );
      })}
    </div>
  );
}
