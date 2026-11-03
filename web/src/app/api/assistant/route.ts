import { NextResponse } from "next/server";
import type { AssistantKB } from "@/lib/assistant/types";
import { candidateProcess, employerProcess, services } from "@/content/company";
import { FOUNDED_YEAR } from "@/lib/site";
import { getArticles, getFaqs, getIndustries, getOpenJobs, getSettings, getTeam, getTestimonials } from "@/lib/wp";

export const revalidate = 600;

/**
 * Knowledge for the website assistant, built from live WordPress content.
 * Loaded only when a visitor opens the chat, so it never slows page loads.
 */
export async function GET() {
  const [jobs, industries, faqs, team, settings, articles, testimonials] = await Promise.all([
    getOpenJobs(),
    getIndustries(),
    getFaqs(),
    getTeam(),
    getSettings(),
    getArticles(),
    getTestimonials(),
  ]);
  const founder = team[0];
  const kb: AssistantKB = {
    jobs: jobs.map(({ slug, title, location, city, industry, summary, highlights, requirements, salaryMin, salaryMax, salaryNote }) => ({
      slug, title, location, city, industry, summary, highlights, requirements, salaryMin, salaryMax, salaryNote,
    })),
    industries: industries.map(({ slug, name, navLabel, tagline, intro, specialisms, roles, primary }) => ({ slug, name, navLabel, tagline, intro, specialisms, roles, primary })),
    faqs,
    team: team.map(({ slug, name, role, phone, email }) => ({ slug, name, role, phone, email })),
    settings: { phone: settings.phone, phoneHref: settings.phoneHref, email: settings.email, linkedin: settings.linkedin },
    services: services.map((s) => ({ ...s })),
    employerProcess: employerProcess.map((s) => ({ ...s })),
    candidateProcess: candidateProcess.map((s) => ({ ...s })),
    articles: articles.map(({ slug, title, excerpt }) => ({ slug, title, excerpt })),
    testimonials: testimonials.map(({ quote, name, role, company, audience }) => ({ quote, name, role, company, audience })),
    founded: FOUNDED_YEAR,
    founder: { name: founder?.name ?? "Sukhjit Singh Lalli", bio: founder?.bio ?? [] },
  };
  return NextResponse.json(kb, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } });
}
