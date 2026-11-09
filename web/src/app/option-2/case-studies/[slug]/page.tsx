import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, PageHero } from "@/option-2/components/ui";
import { CtaBand } from "@/option-2/components/CtaBand";
import { getCaseStudies } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
}

async function find(slug: string) {
  return (await getCaseStudies()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await find((await params).slug);
  if (!c) return {};
  return buildMetadata({ title: c.title, description: c.summary, path: `/case-studies/${c.slug}`, image: c.image });
}

export default async function CaseStudyPage({ params }: Props) {
  const c = await find((await params).slug);
  if (!c) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Case studies", path: "/case-studies" },
          { name: c.title, path: `/case-studies/${c.slug}` },
        ])}
      />
      <PageHero eyebrow={`${c.industry} · ${c.client}`} title={c.title} intro={c.summary} />
      <section className="py-12 md:py-16">
        <div className="container-sw max-w-3xl space-y-12">
          {[
            ["The challenge", c.challenge],
            ["Our approach", c.approach],
            ["The outcome", c.outcome],
          ].map(([h, b]) => (
            <div key={h}>
              <h2 className="text-3xl">{h}</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">{b}</p>
            </div>
          ))}
          {c.quote ? (
            <figure className="border-l-4 border-gold pl-6">
              <blockquote className="font-serif text-2xl leading-relaxed">&ldquo;{c.quote}&rdquo;</blockquote>
              {c.quoteBy ? <figcaption className="mt-4 font-bold">{c.quoteBy}</figcaption> : null}
            </figure>
          ) : null}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
