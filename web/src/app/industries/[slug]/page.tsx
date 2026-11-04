import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Arrow, JsonLd, PageHero, SectionHeading, TickList } from "@/components/ui";
import { JobRow } from "@/components/JobBits";
import { CtaBand } from "@/components/CtaBand";
import { Testimonials } from "@/components/Testimonials";
import { getIndustries, getIndustry, getOpenJobs, getTestimonials } from "@/lib/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getIndustries()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = await getIndustry(slug);
  if (!ind) return {};
  return buildMetadata({
    title: `${ind.name} Recruitment Agency in Vancouver`,
    description: `${ind.name} recruiters in Vancouver. ${ind.tagline} Hire ${ind.roles.slice(0, 3).join(", ")} and more with Sharpe Wysman.`.slice(0, 300),
    path: `/industries/${ind.slug}`,
    image: ind.image,
  });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const [ind, all, jobs, testimonials] = await Promise.all([getIndustry(slug), getIndustries(), getOpenJobs(), getTestimonials()]);
  if (!ind) notFound();
  const roles = jobs.filter((j) => j.industry === ind.slug);
  const others = all.filter((i) => i.slug !== ind.slug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Industries", path: "/industries" },
            { name: ind.name, path: `/industries/${ind.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: `${ind.name} recruitment`,
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: { "@type": "AdministrativeArea", name: "Metro Vancouver" },
            description: ind.intro,
          },
        ]}
      />
      <PageHero
        eyebrow={ind.primary ? "Our specialty" : "Industries we serve"}
        title={<>{ind.name} recruitment</>}
        intro={ind.tagline}
        crumbs={[{ name: "Industries", path: "/industries" }, { name: ind.name }]}
        image={ind.image}
      >
        <Link href="/contact?topic=hire" className="btn btn-gold">
          Hire {ind.primary ? "accounting talent" : `in ${ind.navLabel.toLowerCase()}`} <Arrow />
        </Link>
        <Link href={roles.length ? "#roles" : "/contact?topic=register"} className="btn btn-ghost-light">
          {roles.length ? `See ${roles.length} open roles` : "Register your interest"}
        </Link>
      </PageHero>

      <section className="py-20 md:py-28">
        <div className="container-sw grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow={`Why ${ind.navLabel.toLowerCase()} matters`} title={`The importance of ${ind.name.toLowerCase()}`} />
            <p className="mt-6 text-lg leading-relaxed text-muted">{ind.intro}</p>
            <h3 className="mt-14 text-3xl">Specialties within {ind.name.toLowerCase()}</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {ind.specialisms.map((s, i) => (
                <li key={s} data-reveal style={{ ["--i" as string]: i }} className="flex items-center gap-3 rounded-lg border border-line bg-white px-5 py-4 font-bold transition hover:border-ink">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <aside data-reveal data-glow className="self-start rounded-xl bg-ink p-8 text-white md:p-10">
            <p className="eyebrow text-gold">Key skills &amp; qualifications we look for</p>
            <TickList items={ind.skills} tone="dark" className="mt-6 text-white/90" />
          </aside>
        </div>
      </section>

      <section id="roles" className="border-t border-line bg-white py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading eyebrow="Current opportunities" title={roles.length ? `Open ${ind.navLabel.toLowerCase()} roles` : "No advertised roles right now"} />
          {roles.length ? (
            <ul data-reveal className="mt-10 border-t border-ink">
              {roles.map((j) => (
                <JobRow key={j.slug} job={j} />
              ))}
            </ul>
          ) : (
            <div className="mt-8 grid gap-8 rounded-xl border border-line bg-paper p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
              <p className="max-w-2xl text-lg text-muted">
                Many of our {ind.navLabel.toLowerCase()} searches are confidential and never advertised. Register your resume and we&rsquo;ll contact you when a
                suitable role comes in, or browse our other open roles.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact?topic=register" className="btn btn-ink">
                  Register your resume
                </Link>
                <Link href="/jobs" className="btn btn-ghost">
                  All jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {ind.primary ? (
        <section className="on-dark bg-ink py-20 text-white md:py-28">
          <div className="container-sw">
            <SectionHeading tone="dark" eyebrow="Testimonials" title="Trusted by accounting leaders" />
            <div data-reveal className="mt-10">
              <Testimonials items={testimonials} tone="dark" />
            </div>
          </div>
        </section>
      ) : (
        <section className="border-t border-line py-20 md:py-24">
          <div className="container-sw grid gap-10 lg:grid-cols-2 lg:items-center">
            <div data-reveal="clip" className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image src="/images/team-collaboration.jpg" alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div>
              <SectionHeading
                eyebrow="Our approach"
                title="The same standards, in every field"
                intro="Integrity, expertise and professionalism. We take the time to understand the role and the fit, and we never push anyone to make or accept an offer."
              />
              <Link href="/about" className="link-arrow mt-8">
                About Sharpe Wysman <Arrow />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line py-16">
        <div className="container-sw">
          <p className="eyebrow text-muted">Other industries</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/industries/${o.slug}`} className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 font-bold transition hover:border-ink">
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
