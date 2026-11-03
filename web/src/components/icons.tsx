import type { ReactNode, SVGProps } from "react";

/**
 * Sharpe Wysman icon set: drawn in-house, not from an icon library.
 *
 * House style:
 *  - 24px grid, 1.6 stroke, round caps and joins
 *  - Curved, calligraphic heads and strokes (an accountant's pen tick)
 *  - Open circles echo the crescents of the Sharpe Wysman mark
 *    (search lens, location pin, clock face, service marks)
 */

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { title?: string };

function Svg({ title, children, viewBox = "0 0 24 24", strokeWidth = 1.6, className = "h-5 w-5", ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------- navigation */

/** Arrow with a swept, pen-drawn head. */
export const IconArrow = (p: IconProps) => (
  <Svg {...p} data-icon="arrow">
    <path d="M3.5 12h15.8" />
    <path d="M13.6 6.2c1.5 2.5 3.6 4.4 6.4 5.8-2.8 1.4-4.9 3.3-6.4 5.8" />
  </Svg>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 17.5 17.4 6.6" />
    <path d="M8.6 6.4c3.2.6 6 .6 9.1 0-.6 3.1-.6 5.9 0 9.1" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5c2.4 1.6 4.4 3.5 6 6 1.6-2.5 3.6-4.4 6-6" />
  </Svg>
);

/** Lens drawn as an open crescent, like the logo. */
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16.9 11.1a6.4 6.4 0 1 1-2.6-5.2" />
    <path d="M15.6 15.6 20 20" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5v13" />
    <path d="M5.5 12h13" />
  </Svg>
);

/* ------------------------------------------------------------- contact */

export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.2 3.8h2.5c.5 0 .9.3 1 .8l.8 3.1c.1.4 0 .8-.4 1.1L8.6 10a11.6 11.6 0 0 0 5.4 5.4l1.1-1.5c.3-.4.7-.5 1.1-.4l3.1.8c.5.1.8.5.8 1v2.5c0 .7-.6 1.2-1.3 1.2C11.4 19 5 12.6 5 5.1c0-.7.5-1.3 1.2-1.3Z" />
  </Svg>
);

/** Envelope whose flap is a tick. */
export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
    <path d="M4.2 7.4c2.9 2.6 5.4 4.4 7.8 5.6 2.4-1.2 4.9-3 7.8-5.6" />
  </Svg>
);

/** Location pin with a crescent at its centre. */
export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21c-4-4.3-6.6-7.8-6.6-11a6.6 6.6 0 0 1 13.2 0c0 3.2-2.6 6.7-6.6 11Z" />
    <path d="M14.3 10a2.3 2.3 0 1 1-1.3-2.1" />
  </Svg>
);

export const IconLinkedIn = (p: IconProps) => (
  // Official LinkedIn "in" glyph (trademark: used unaltered, per LinkedIn brand guidelines)
  <svg viewBox="0 0 24 24" fill="currentColor" className={p.className ?? "h-5 w-5"} aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

/* ---------------------------------------------------------------- jobs */

export const IconBriefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2.2" />
    <path d="M9 7.5V6c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5v1.5" />
    <path d="M3.8 12.4c5.3 1.8 11.1 1.8 16.4 0" />
  </Svg>
);

/** Clock with an open crescent face. */
export const IconSalary = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5v15" />
    <path d="M15.6 8.2c-.7-1.1-2-1.8-3.6-1.8-2 0-3.4 1.1-3.4 2.6 0 3.6 7 2 7 5.6 0 1.6-1.5 2.7-3.5 2.7-1.6 0-3-.7-3.7-1.9" />
  </Svg>
);

/** Resume: a ledger page with a ticked line. */
export const IconDocument = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3.5h7.2l4.3 4.3v12.7h-11.5Z" />
    <path d="M13.5 3.7v4.3h4.3" />
    <path d="M9 12.5h6M9 15.5h3.6" />
    <path d="M13.8 16.2c.5.3.9.7 1.3 1.3 1-1.8 2.1-3 3.6-3.7" strokeWidth="1.4" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15.5V4.6" />
    <path d="M7.9 8.4c1.6-1 2.9-2.3 4.1-4 1.2 1.7 2.5 3 4.1 4" />
    <path d="M4.5 14.5V18c0 .9.7 1.5 1.5 1.5h12c.8 0 1.5-.6 1.5-1.5v-3.5" />
  </Svg>
);

/* ------------------------------------------------------------ industries
 * Drawn on a 32px grid at 1.5 stroke for more detail at larger sizes. */

const Industry = ({ children, ...p }: IconProps & { children: ReactNode }) => (
  <Svg viewBox="0 0 32 32" strokeWidth={1.5} className="h-8 w-8" {...p}>
    {children}
  </Svg>
);

/** Accounting: an open ledger with a ticked column. */
export const IconLedger = (p: IconProps) => (
  <Industry {...p}>
    <path d="M16 8.5c-3-1.8-6.6-2.4-10.5-2v17c3.9-.4 7.5.2 10.5 2 3-1.8 6.6-2.4 10.5-2v-17c-3.9-.4-7.5.2-10.5 2Z" />
    <path d="M16 8.5v17" />
    <path d="M8.5 12.5h4.5M8.5 16h4.5M8.5 19.5h3" />
    <path d="M19 15.6c.7.4 1.3 1 1.8 1.9 1.3-2.4 2.8-4 4.4-4.9" />
  </Industry>
);

/** Legal: scales whose pans are crescents. */
export const IconScales = (p: IconProps) => (
  <Industry {...p}>
    <path d="M16 5v20.5M10.5 25.5h11" />
    <path d="M7 9.5c3 .9 6 .9 9 0 3 .9 6 .9 9 0" />
    <path d="m7 9.8-3.4 8M7 9.8l3.4 8M25 9.8l-3.4 8M25 9.8l3.4 8" />
    <path d="M3.3 17.8a3.8 3.8 0 0 0 7.4 0M21.3 17.8a3.8 3.8 0 0 0 7.4 0" />
  </Industry>
);

/** Information technology: brackets around a cursor. */
export const IconCode = (p: IconProps) => (
  <Industry {...p}>
    <path d="M10.5 9.5C8.4 11.4 6.6 13.5 5 16c1.6 2.5 3.4 4.6 5.5 6.5" />
    <path d="M21.5 9.5c2.1 1.9 3.9 4 5.5 6.5-1.6 2.5-3.4 4.6-5.5 6.5" />
    <path d="M17.6 8.5 14.4 23.5" />
  </Industry>
);

/** Human resources: two people, the second partly behind the first. */
export const IconPeople = (p: IconProps) => (
  <Industry {...p}>
    <circle cx="12.5" cy="11" r="4" />
    <path d="M4.5 25.5c.6-4.4 3.8-7.3 8-7.3s7.4 2.9 8 7.3" />
    <path d="M19.4 7.4a4 4 0 1 1 1.3 7.6" />
    <path d="M23 18.6c2.6.9 4.2 3.4 4.5 6.9" />
  </Industry>
);

/** Engineering: a drafting compass over an arc. */
export const IconCompass = (p: IconProps) => (
  <Industry {...p}>
    <circle cx="16" cy="7.5" r="2.2" />
    <path d="M14.9 9.4 8.5 25M17.1 9.4 23.5 25" />
    <path d="M7 19.5c5.7 2.6 12.3 2.6 18 0" />
  </Industry>
);

export const INDUSTRY_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  accounting: IconLedger,
  legal: IconScales,
  "information-technology": IconCode,
  "human-resources": IconPeople,
  engineering: IconCompass,
};

/* ------------------------------------------------------------- services */

/** Search & selection: the logo's concentric crescents with a target point. */
export const IconSearchSelection = (p: IconProps) => (
  <Industry {...p}>
    <path d="M25.4 9.2A11 11 0 1 0 25.4 22.8" />
    <path d="M21.4 11.6a6.4 6.4 0 1 0 0 8.8" />
    <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
    <path d="M18.5 16H29" />
  </Industry>
);

/** Contingency search: a widened network around your own team. */
export const IconNetwork = (p: IconProps) => (
  <Industry {...p}>
    <circle cx="16" cy="16" r="3.2" />
    <circle cx="6.5" cy="8.5" r="2" />
    <circle cx="25.5" cy="8.5" r="2" />
    <circle cx="6.5" cy="23.5" r="2" />
    <circle cx="25.5" cy="23.5" r="2" />
    <path d="M8.2 9.8c2.4 1.4 4 2.6 5.3 4M23.8 9.8c-2.4 1.4-4 2.6-5.3 4M8.2 22.2c2.4-1.4 4-2.6 5.3-4M23.8 22.2c-2.4-1.4-4-2.6-5.3-4" />
  </Industry>
);

/** Workplace consulting: a team structure. */
export const IconStructure = (p: IconProps) => (
  <Industry {...p}>
    <rect x="12" y="4.5" width="8" height="6" rx="1.6" />
    <rect x="4" y="21.5" width="8" height="6" rx="1.6" />
    <rect x="20" y="21.5" width="8" height="6" rx="1.6" />
    <path d="M16 10.5v5M8 21.5c0-3.3 1.6-5 4-5.5 2.4-.4 5.6-.4 8 0 2.4.5 4 2.2 4 5.5" />
  </Industry>
);

export const SERVICE_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  "search-and-selection": IconSearchSelection,
  "contingency-search": IconNetwork,
  "workplace-consulting": IconStructure,
};

/* --------------------------------------------------------------- quote */

/** Quotation mark built from two crescents. */
export const IconQuote = (p: IconProps) => (
  <svg viewBox="0 0 48 32" className={p.className ?? "h-8 w-12"} fill="currentColor" aria-hidden>
    <path d="M18.5 2.2C10.2 4.4 4 10.3 4 18.6 4 25 7.7 29.5 12.8 29.5c4.3 0 7.2-3 7.2-7 0-3.8-2.7-6.6-6.4-6.6-.9 0-1.8.2-2.5.5.9-4.6 4.6-8.2 9.4-10l-2-4.2Z" />
    <path d="M42.5 2.2C34.2 4.4 28 10.3 28 18.6c0 6.4 3.7 10.9 8.8 10.9 4.3 0 7.2-3 7.2-7 0-3.8-2.7-6.6-6.4-6.6-.9 0-1.8.2-2.5.5.9-4.6 4.6-8.2 9.4-10l-2-4.2Z" />
  </svg>
);
