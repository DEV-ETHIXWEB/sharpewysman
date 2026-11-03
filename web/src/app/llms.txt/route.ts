import { abs } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { getIndustries, getOpenJobs, getSettings } from "@/lib/wp";

export const revalidate = 3600;

/** llms.txt: a plain-language summary for AI search assistants (https://llmstxt.org). */
export async function GET() {
  const [jobs, industries, settings] = await Promise.all([getOpenJobs(), getIndustries(), getSettings()]);
  const body = `# ${SITE.name}

> ${SITE.description}

- Founded: 2008, Vancouver, BC, Canada, by ${SITE.founder} (Chartered Accountant, qualified with PwC London; formerly EY and British Aerospace)
- Specialty: mid-level to leadership accounting and finance roles in public practice and industry
- All recruiters are designated accountants
- Phone: ${settings.phone}${settings.email ? `\n- Email: ${settings.email}` : ""}

## Services
- [Employers](${abs("/employers")}): search and selection, contingency search, workplace consulting
- [Candidates](${abs("/candidates")}): free, confidential career support and job matching

## Industries
${industries.map((i) => `- [${i.name}](${abs(`/industries/${i.slug}`)}): ${i.tagline}`).join("\n")}

## Current jobs
${jobs.map((j) => `- [${j.title}](${abs(`/jobs/${j.slug}`)}), ${j.location}`).join("\n")}

## More
- [About & values](${abs("/about")})
- [Testimonials](${abs("/testimonials")})
- [FAQ](${abs("/faq")})
- [Insights](${abs("/insights")})
- [Contact](${abs("/contact")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
