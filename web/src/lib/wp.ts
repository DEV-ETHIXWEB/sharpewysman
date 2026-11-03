import "server-only";
import { cache } from "react";
import type { Article, CaseStudy, Faq, Industry, Job, SiteSettings, TeamMember, Testimonial } from "./types";
import { DEFAULT_SETTINGS } from "./site";
import { noDashes } from "./text";
import { jobs as seedJobs } from "@/content/jobs";
import { testimonials as seedTestimonials, team as seedTeam } from "@/content/people";
import { industries as seedIndustries } from "@/content/industries";
import { faqs as seedFaqs } from "@/content/company";
import { articles as seedArticles } from "@/content/articles";
import { caseStudies as seedCaseStudies } from "@/content/case-studies";

/**
 * Headless WordPress client.
 *
 * WordPress (with the `sharpe-wysman-headless` plugin) is the source of truth.
 * Every getter falls back to the bundled seed content when WordPress is
 * unreachable or the plugin's endpoint does not exist yet, so the site always
 * renders. `null` from wpFetch means "endpoint unavailable"; an empty array is
 * a real, editor-intended empty list and is respected.
 */

const WP_URL = (process.env.WORDPRESS_URL ?? "https://sharpewysman.com").replace(/\/$/, "");
const REVALIDATE = Number(process.env.WP_REVALIDATE_SECONDS ?? 600);

async function wpFetch<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${WP_URL}/wp-json${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE, tags: ["wp", ...tags] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#039": "'", apos: "'", nbsp: " ", hellip: "…", ndash: "-", mdash: "-", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
export function decodeEntities(s: string): string {
  return noDashes(
    s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z0-9#]+);/gi, (m, e) => ENTITIES[e] ?? m),
  );
}
const stripTags = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

interface WPRendered { rendered: string }
interface WPItem<S> {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: WPRendered;
  content: WPRendered;
  excerpt?: WPRendered;
  /** Normalised fields added by the plugin via register_rest_field */
  sw?: S;
}

/* ------------------------------------------------------------------ jobs */

type JobFields = Omit<Job, "slug" | "title" | "body" | "datePosted">;

export const getJobs = cache(async (): Promise<Job[]> => {
  const data = await wpFetch<WPItem<JobFields>[]>("/wp/v2/sw-jobs?per_page=100&orderby=date&order=desc", ["wp:jobs"]);
  if (!data) return seedJobs;
  return data
    .filter((d) => d.sw)
    .map((d) => ({
      ...(d.sw as JobFields),
      slug: d.slug,
      title: decodeEntities(d.title.rendered),
      body: d.content.rendered,
      datePosted: d.date.slice(0, 10),
    }));
});

export async function getOpenJobs(): Promise<Job[]> {
  return (await getJobs()).filter((j) => j.status === "open");
}

export async function getJob(slug: string): Promise<Job | undefined> {
  return (await getJobs()).find((j) => j.slug === slug);
}

/* ---------------------------------------------------------- testimonials */

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const data = await wpFetch<WPItem<Omit<Testimonial, "id" | "quote" | "name">>[]>(
    "/wp/v2/sw-testimonials?per_page=100&orderby=menu_order&order=asc",
    ["wp:testimonials"],
  );
  if (!data) return seedTestimonials;
  return data
    .filter((d) => d.sw)
    .map((d) => ({
      ...(d.sw as Omit<Testimonial, "id" | "quote" | "name">),
      id: d.slug,
      name: decodeEntities(d.title.rendered),
      quote: stripTags(d.content.rendered),
    }));
});

/* ------------------------------------------------------------------ team */

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const data = await wpFetch<WPItem<Omit<TeamMember, "slug" | "name" | "bio">>[]>(
    "/wp/v2/sw-team?per_page=100&orderby=menu_order&order=asc",
    ["wp:team"],
  );
  if (!data) return seedTeam;
  return data
    .filter((d) => d.sw)
    .map((d) => ({
      ...(d.sw as Omit<TeamMember, "slug" | "name" | "bio">),
      slug: d.slug,
      name: decodeEntities(d.title.rendered),
      bio: d.content.rendered
        .split(/<\/p>/)
        .map(stripTags)
        .filter(Boolean),
    }));
});

/* ------------------------------------------------------------ industries */

export const getIndustries = cache(async (): Promise<Industry[]> => {
  const data = await wpFetch<WPItem<Omit<Industry, "slug" | "name" | "intro">>[]>(
    "/wp/v2/sw-industries?per_page=100",
    ["wp:industries"],
  );
  const list = !data
    ? seedIndustries
    : data
        .filter((d) => d.sw)
        .map((d) => ({
          ...(d.sw as Omit<Industry, "slug" | "name" | "intro">),
          slug: d.slug,
          name: decodeEntities(d.title.rendered),
          intro: stripTags(d.content.rendered),
        }));
  return [...list].sort((a, b) => a.order - b.order);
});

export async function getIndustry(slug: string): Promise<Industry | undefined> {
  return (await getIndustries()).find((i) => i.slug === slug);
}

/* ------------------------------------------------------------------ faqs */

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const data = await wpFetch<WPItem<Pick<Faq, "audience">>[]>(
    "/wp/v2/sw-faqs?per_page=100&orderby=menu_order&order=asc",
    ["wp:faqs"],
  );
  if (!data) return seedFaqs;
  return data.map((d) => ({
    id: d.slug,
    question: decodeEntities(d.title.rendered),
    answer: stripTags(d.content.rendered),
    audience: d.sw?.audience ?? "general",
  }));
});

/* ---------------------------------------------------------- case studies */

export const getCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  const data = await wpFetch<WPItem<Omit<CaseStudy, "slug" | "title" | "summary">>[]>(
    "/wp/v2/sw-case-studies?per_page=100",
    ["wp:case-studies"],
  );
  if (!data) return seedCaseStudies;
  return data
    .filter((d) => d.sw)
    .map((d) => ({
      ...(d.sw as Omit<CaseStudy, "slug" | "title" | "summary">),
      slug: d.slug,
      title: decodeEntities(d.title.rendered),
      summary: stripTags(d.content.rendered),
    }));
});

/* -------------------------------------------------------------- articles */

interface WPPost extends WPItem<{ image?: string; category?: string; author?: string }> {
  excerpt: WPRendered;
}

const PLACEHOLDER_POSTS = new Set(["hello-world"]);

export const getArticles = cache(async (): Promise<Article[]> => {
  const data = await wpFetch<WPPost[]>("/wp/v2/posts?per_page=50&status=publish", ["wp:posts"]);
  const fromWp = (data ?? [])
    .filter((p) => !PLACEHOLDER_POSTS.has(p.slug))
    .map<Article>((p) => ({
      slug: p.slug,
      title: decodeEntities(p.title.rendered),
      excerpt: stripTags(p.excerpt.rendered),
      date: p.date.slice(0, 10),
      modified: p.modified.slice(0, 10),
      author: p.sw?.author ?? "Sharpe Wysman",
      category: p.sw?.category ?? "Insights",
      html: p.content.rendered,
      image: p.sw?.image,
    }));
  // Until editors publish real posts, show the bundled launch articles.
  return fromWp.length ? fromWp : seedArticles;
});

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/* ----------------------------------------------------------------- pages */

export const getWpPage = cache(async (slug: string): Promise<{ title: string; html: string; modified: string } | null> => {
  const data = await wpFetch<WPItem<never>[]>(`/wp/v2/pages?slug=${encodeURIComponent(slug)}`, [`wp:page:${slug}`]);
  const page = data?.[0];
  if (!page) return null;
  return { title: decodeEntities(page.title.rendered), html: page.content.rendered, modified: page.modified.slice(0, 10) };
});

/* -------------------------------------------------------------- settings */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const data = await wpFetch<Partial<SiteSettings>>("/sw/v1/settings", ["wp:settings"]);
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "" && v != null)),
    stats: data.stats?.length ? data.stats : DEFAULT_SETTINGS.stats,
  } as SiteSettings;
});

export { WP_URL };
