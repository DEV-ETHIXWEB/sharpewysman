import { JsonLd, PageHero } from "./ui";
import { formatDate } from "./ArticleCard";
import { cleanHtml, dropLeadingTitle, fillLegalPlaceholders } from "@/lib/sanitize";
import { getSettings, getWpPage } from "@/lib/wp";
import { breadcrumbLd } from "@/lib/seo";
import { legalPages } from "@/content/legal";

export async function LegalPage({ slug, name }: { slug: string; name: string }) {
  const [wp, settings] = await Promise.all([getWpPage(slug), getSettings()]);
  const local = legalPages[slug];
  // The newer copy wins: the site's own text until someone updates the page in WordPress.
  const page = wp && (!local || wp.modified > local.modified) ? wp : (local ?? wp);
  const esc = (t: string) => t.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const contact = [
    `<a href="tel:${esc(settings.phoneHref)}">${esc(settings.phone)}</a>`,
    settings.email ? `<a href="mailto:${esc(settings.email)}">${esc(settings.email)}</a>` : "",
  ]
    .filter(Boolean)
    .join(" or ");
  const html = page
    ? fillLegalPlaceholders(dropLeadingTitle(dropLeadingTitle(cleanHtml(page.html), page.title), name)).replace(/\{\{contact\}\}/g, contact)
    : "";
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name, path: `/${slug}` }])} />
      <PageHero eyebrow="Legal" title={name} intro={page ? `Last updated ${formatDate(page.modified)}` : undefined} />
      <section className="py-12 md:py-16">
        <h2 className="sr-only">Full text</h2>
        <div className="container-sw">
          <div className="prose-sw mx-auto max-w-[46rem]" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    </>
  );
}
