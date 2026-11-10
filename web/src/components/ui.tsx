import Image from "next/image";
import Link from "next/link";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { IconArrow } from "./icons";

/* ---------------------------------------------------------- maskWords */

/** Wraps each word of a headline so it can rise from behind its baseline (see .mw/.mi). Spacing and nested colour spans are kept. */
/** Typographic apostrophes for display copy. */
export const typo = (s: string) => s.replace(/'/g, "’");
function typoNode(x: ReactNode): ReactNode {
  if (typeof x === "string") return typo(x);
  if (Array.isArray(x)) return Children.toArray(x).map(typoNode);
  if (isValidElement<{ children?: ReactNode }>(x) && x.props.children !== undefined) return cloneElement(x, undefined, typoNode(x.props.children));
  return x;
}

export function maskWords(node: ReactNode): ReactNode {
  let n = 0;
  const walk = (x: ReactNode): ReactNode => {
    if (typeof x === "string") {
      return typo(x).split(/(\s+)/).map((part, i) =>
        !part.trim() ? (
          part
        ) : (
          <span key={i} className="mw">
            <span className="mi" style={{ ["--w" as string]: n++ }}>
              {part}
            </span>
          </span>
        ),
      );
    }
    if (Array.isArray(x)) return Children.toArray(x).map(walk);
    if (isValidElement<{ children?: ReactNode }>(x) && x.props.children !== undefined) {
      return cloneElement(x, undefined, walk(x.props.children));
    }
    return x;
  };
  return walk(node);
}

/* --------------------------------------------------------------- Tick */

/**
 * The auditor's tick mark: accountants tick figures they have verified.
 * Used as the site's signature mark.
 */
export function Tick({
  className = "",
  animate = false,
  delay = 0,
  strokeWidth = 2.6,
  title,
}: {
  className?: string;
  animate?: boolean;
  delay?: number;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 16"
      className={`${animate ? "tick-draw" : ""} ${className}`}
      style={{ ["--len" as string]: 26, ["--delay" as string]: `${delay}s` }}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M1.5 9.2c1.6 1 3.1 2.4 4.4 4.6C9 7.6 13 3.4 18.5 1.2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------------------------------------------- Logo */

export function Logo({ variant = "light", className = "", priority = false }: { variant?: "light" | "dark"; className?: string; priority?: boolean }) {
  return (
    <Image
      src={variant === "light" ? "/images/logo-light.png" : "/images/logo-dark.png"}
      alt="Sharpe Wysman Recruitment Solutions"
      width={920}
      height={158}
      priority={priority}
      sizes="200px"
      className={`h-auto w-[172px] md:w-[200px] ${className}`}
    />
  );
}

/* -------------------------------------------------------------- JSON-LD */

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON-LD must not be HTML-escaped, but "<" is escaped to prevent </script> injection.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------ Headings */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
  as: As = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div data-reveal className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow ? (
        <p className={`eyebrow mb-4 ${dark ? "text-gold" : "text-maroon"}`}>
          {align === "center" ? null : <span className="eyebrow-rule" aria-hidden />}
          {eyebrow}
        </p>
      ) : null}
      <As className={`text-[2.1rem] leading-[1.08] md:text-5xl ${dark ? "text-white" : "text-ink"}`}>{maskWords(title)}</As>
      {intro ? (
        <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-muted-dark" : "text-muted"} ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {typoNode(intro)}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- Breadcrumbs */

export function Breadcrumbs({ items, tone = "dark" }: { items: { name: string; path?: string }[]; tone?: "dark" | "light" }) {
  const base = tone === "dark" ? "text-muted-dark" : "text-muted";
  return (
    <nav aria-label="Breadcrumb" className={`eyebrow ${base}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
        </li>
        {items.map((it) => (
          <li key={it.name} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {it.path ? (
              <Link href={it.path} className="hover:text-gold">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className={tone === "dark" ? "text-white" : "text-ink"}>
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------ PageHero */

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs: { name: string; path?: string }[];
  children?: ReactNode;
  image?: string;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-ink text-white">
      <ArcMotif className="spin-slow pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] text-gold/[0.07] md:-right-24" />
      <div className={`container-sw relative grid gap-10 pb-16 pt-10 md:pb-24 md:pt-14 ${image ? "lg:grid-cols-[1.2fr_0.8fr] lg:items-end" : ""}`}>
        <div>
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow mt-10 text-gold">{eyebrow}</p>
          <h1 className="hero-title lift mt-4 max-w-4xl text-[2.4rem] md:text-[3.4rem] lg:text-[3.9rem]">{typoNode(title)}</h1>
          {intro ? (
            <p className="lift mt-6 max-w-2xl text-lg leading-relaxed text-muted-dark md:text-xl" style={{ ["--delay" as string]: "0.08s" }}>
              {typoNode(intro)}
            </p>
          ) : null}
          {children ? (
            <div className="lift mt-9 flex flex-wrap gap-3" style={{ ["--delay" as string]: "0.16s" }}>
              {children}
            </div>
          ) : null}
        </div>
        {image ? (
          <div className="lift relative hidden aspect-[4/5] overflow-hidden rounded-t-[10rem] lg:block" style={{ ["--delay" as string]: "0.12s" }}>
            <Image src={image} alt="" fill sizes="(min-width: 1024px) 30vw, 0px" className="parallax-img object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- ArcMotif */

/** Concentric crescents drawn from the Sharpe Wysman mark. */
export function ArcMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none" stroke="currentColor">
      <path d="M330 70A170 170 0 1 0 330 330" strokeWidth="38" strokeLinecap="round" />
      <path d="M300 125A110 110 0 1 0 300 275" strokeWidth="26" strokeLinecap="round" />
      <path d="M262 168A54 54 0 1 0 262 232" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------------------------------------- Arrow */

/** House arrow (see icons.tsx). Inside a .btn it renders as the button's arrow chip. */
export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return <IconArrow className={className} strokeWidth={1.8} />;
}

/* ------------------------------------------------------------ TickList */

export function TickList({ items, className = "", tone = "light" }: { items: string[]; className?: string; tone?: "light" | "dark" }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((it) => (
        <li key={it} className="flex gap-3">
          <Tick className={`mt-[0.45em] h-3.5 w-4 shrink-0 ${tone === "dark" ? "text-gold" : "text-maroon"}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
