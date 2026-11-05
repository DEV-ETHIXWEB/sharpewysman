import Image from "next/image";
import type { ReactNode } from "react";
import { IconArrow } from "./icons";

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
      className={`h-auto w-[200px] md:w-[236px] ${className}`}
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
      <As className={`text-[2.1rem] leading-[1.08] md:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</As>
      {intro ? (
        <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-muted-dark" : "text-muted"} ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ PageHero */

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  image,
  video,
  caption,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  image?: string;
  /** A short, muted, looping clip in place of the still image. `image` is still required: it's the poster frame, and what shows under prefers-reduced-motion. */
  video?: string;
  /** A short line that fades up from the bottom of the image/video on hover, like a caption. */
  caption?: string;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-ink text-white">
      <ArcMotif className="spin-slow pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] text-gold/[0.07] md:-right-24" />
      <div
        className={`container-sw relative grid gap-10 pb-16 pt-[7.5rem] md:pb-24 md:pt-[9.25rem] lg:min-h-[53rem] lg:items-start ${
          image ? "lg:grid-cols-[1.2fr_0.8fr]" : ""
        }`}
      >
        <div>
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="lift mt-4 max-w-4xl text-[2.4rem] md:text-[3.4rem] lg:text-[3.9rem]">{title}</h1>
          {intro ? (
            <p className="lift mt-6 max-w-2xl text-lg leading-relaxed text-muted-dark md:text-xl" style={{ ["--delay" as string]: "0.08s" }}>
              {intro}
            </p>
          ) : null}
          {children ? (
            <div className="lift mt-9 flex flex-wrap gap-3" style={{ ["--delay" as string]: "0.16s" }}>
              {children}
            </div>
          ) : null}
        </div>
        {image ? (
          <div
            className="lift group relative hidden aspect-[4/5] overflow-hidden rounded-t-[10rem] lg:block"
            style={{ ["--delay" as string]: "0.12s" }}
          >
            {video ? (
              <video
                src={video}
                poster={image}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              />
            ) : null}
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, 0px"
              className={`parallax-img object-cover ${video ? "hidden motion-reduce:block" : ""}`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent transition-opacity duration-500 group-hover:from-ink/85" aria-hidden />
            {caption ? (
              <p className="font-display absolute inset-x-0 bottom-0 translate-y-2 px-7 pb-7 text-lg italic leading-snug text-white/90 opacity-0 transition-all duration-500 ease-[var(--ease-out-quart)] group-hover:translate-y-0 group-hover:opacity-100">
                {caption}
              </p>
            ) : null}
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
