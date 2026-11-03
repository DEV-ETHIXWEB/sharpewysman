/**
 * Shared content types. Every type here maps 1:1 to a WordPress custom post
 * type registered by the `sharpe-wysman-headless` plugin (see /wordpress).
 */

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY";

export interface Job {
  slug: string;
  title: string;
  /** Industry slug, e.g. "accounting" */
  industry: string;
  location: string;
  /** City used for JobPosting structured data */
  city: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  salaryNote?: string;
  /** One or two sentences used on cards and in meta descriptions */
  summary: string;
  /** Trusted HTML (sanitised before render) */
  body: string;
  highlights: string[];
  requirements: string[];
  datePosted: string; // ISO date
  validThrough?: string; // ISO date
  status: "open" | "filled";
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  audience: "client" | "candidate";
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  image?: string;
  bio: string[];
  credentials?: string[];
}

export interface Industry {
  slug: string;
  name: string;
  /** Short label for navigation */
  navLabel: string;
  primary: boolean;
  tagline: string;
  intro: string;
  specialisms: string[];
  skills: string[];
  roles: string[];
  image: string;
  order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  audience: "employer" | "candidate" | "general";
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  quote?: string;
  quoteBy?: string;
  image?: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  modified?: string;
  author: string;
  category: string;
  /** Trusted HTML (sanitised before render) */
  html: string;
  image?: string;
}

export interface Stat {
  value: string;
  label: string;
  note?: string;
}

export interface SiteSettings {
  phone: string;
  phoneHref: string;
  email?: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
  linkedin: string;
  stats: Stat[];
}
