import type { SiteSettings } from "./types";

export const FOUNDED_YEAR = 2008;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharpewysman.com").replace(/\/$/, "");

/** GA4 measurement ID, only if well formed (it is written into an inline script). */
export const GA_ID = /^G-[A-Z0-9]{4,16}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID : undefined;

export const SITE = {
  name: "Sharpe Wysman",
  legalName: "Sharpe Wysman Recruitment Solutions",
  tagline: "Accounting & finance recruitment in Vancouver",
  description:
    "Sharpe Wysman is a Vancouver recruitment firm founded by a Chartered Accountant. Since 2008 we have placed CPAs, tax and audit professionals, controllers and finance leaders with firms across Greater Vancouver.",
  founder: "Sukhjit Singh Lalli",
  locale: "en_CA",
} as const;

export function yearsInBusiness(now = new Date()): number {
  return now.getFullYear() - FOUNDED_YEAR;
}

/**
 * Defaults used when the WordPress settings endpoint is unavailable.
 * Editors override every value in WP Admin → Sharpe Wysman → Settings.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "604-779-5251",
  phoneHref: "+16047795251",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
  addressLocality: "Vancouver",
  addressRegion: "BC",
  addressCountry: "CA",
  linkedin: "https://www.linkedin.com/in/sukhjitlalli/",
  stats: [
    { value: String(yearsInBusiness()), label: "Years recruiting in Vancouver", note: `Founded ${FOUNDED_YEAR}` },
    { value: "600+", label: "Successful placements" },
    { value: "100+", label: "Client firms served" },
    { value: "100%", label: "Recruiters who are designated accountants" },
  ],
};

export const NAV = [
  { href: "/employers", label: "Employers" },
  { href: "/candidates", label: "Candidates" },
  { href: "/jobs", label: "Jobs" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
] as const;
