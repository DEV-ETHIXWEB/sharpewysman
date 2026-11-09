import Image from "next/image";
import Link from "next/link";
import { PageHero, SectionHeading, JsonLd, Arrow } from "@/components/ui";
import { ProcessOrbit } from "@/components/ProcessOrbit";
import { Testimonials } from "@/components/Testimonials";
import { FaqList } from "@/components/FaqList";
import { StatsLedger } from "@/components/StatsLedger";
import { CtaBand } from "@/components/CtaBand";
import { TeamGrid } from "@/components/TeamGrid";
import { ServiceMark } from "@/components/ServiceMark";
import { employerProcess, services } from "@/content/company";
import { getFaqs, getIndustries, getSettings, getTeam, getTestimonials } from "@/lib/wp";
import { breadcrumbLd, buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hire Accountants & Finance Professionals in Vancouver",
  description:
    "Retained search, contingency search and consulting for accounting and finance hires in Vancouver. Shortlists from recruiters who are designated accountants.",
  path: "/employers",
});

export default async function EmployersPage() {
  const [testimonials, faqs, settings, team, industries] = await Promise.all([getTestimonials(), getFaqs(), getSettings(), getTeam(), getIndustries()]);
  const employerFaqs = faqs.filter((f) => f.audience !== "candidate");

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Employers", path: "/employers" }]), faqLd(employerFaqs)]} />
      <PageHero
        eyebrow="For employers"
        title={
          <>
            Top-tier accounting talent, <span className="text-gold">screened by accountants.</span>
          </>
        }
        intro="We connect leading companies and CPA firms with professionals who are hard to find on your own, and we only send candidates we've pre-qualified for your role."
        crumbs={[{ name: "Employers" }]}
        image="/images/team-meeting.jpg"
      >
        <Link href="/contact?topic=hire" className="btn btn-gold">
          Discuss a role <Arrow />
        </Link>
        <a href={`tel:${settings.phoneHref}`} className="btn btn-ghost-light tabular-nums">
          {settings.phone}
        </a>
      </PageHero>

      {/* Why choose us */}
      <section className="py-12 md:py-16">
        <div className="container-sw grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Why choose us"
              title="Fewer resumes. Better hires."
              intro="Welcome to Sharpe Wysman, where we specialize in connecting top-tier talent with leading companies. Here's what that means in practice."
            />
            <dl className="mt-12 space-y-8">
              {[
                ["Access to top talent", "Our extensive network gives you access to the best candidates in the market, including people who aren't actively looking."],
                ["Quick turnarounds", "We understand the urgency of your staffing needs and work to fill positions promptly, without cutting corners on screening."],
                ["Industry-specific knowledge", "Our team has worked inside the professions we recruit for, so we can judge technical fit as well as cultural fit."],
              ].map(([t, b], i) => (
                <div key={t} data-reveal style={{ ["--i" as string]: i }} className="grid gap-2 border-l-2 border-gold pl-6">
                  <dt className="font-display text-2xl">{t}</dt>
                  <dd className="text-muted">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:pt-16">
            <StatsLedger stats={settings.stats} />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="on-dark bg-ink py-12 text-white md:py-16">
        <div className="container-sw">
          <SectionHeading tone="dark" eyebrow="Our services" title="Choose the level of support you need" />
          <div className="mt-14 space-y-px overflow-hidden rounded-xl bg-line-dark">
            {services.map((s, i) => (
              <article key={s.slug} id={s.slug} data-reveal data-glow style={{ ["--i" as string]: i }} className="group grid gap-6 bg-ink-2 p-8 md:grid-cols-[1fr_1.4fr_auto] md:items-start md:gap-12 md:p-12">
                <div>
                  <ServiceMark slug={s.slug} />
                  <h3 className="mt-6 text-3xl text-white md:text-4xl">{s.title}</h3>
                  <p className="mt-3 font-mono text-xs uppercase tracking-widest text-gold">Best for: {s.bestFor}</p>
                </div>
                <div>
                  <p className="font-serif text-xl text-white">{s.lede}</p>
                  <p className="mt-3 text-muted-dark">{s.body}</p>
                </div>
                <Link href={`/contact?topic=hire&service=${s.slug}`} className="link-arrow shrink-0 text-gold">
                  Enquire <Arrow />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading align="center" eyebrow="Our process" title="Four steps to the right hire" intro="A collaborative approach that keeps our search aligned with your vision, from first call to long after the start date." />
          <div data-reveal className="mt-12">
            <ProcessOrbit tracks={[{ id: "employers", label: "For employers", steps: employerProcess }]} />
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="border-y border-line bg-white py-12 md:py-16">
        <div className="container-sw grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image src="/images/partners-office.jpg" alt="Two professionals reviewing work together in an office" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow="Industries we serve" title="Staffing solutions across five fields" intro="Accounting and finance is our specialism. We also recruit for the teams that work alongside them." />
            <ul className="mt-8 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {industries.map((i) => (
                <li key={i.slug}>
                  <Link href={`/industries/${i.slug}`} className="flex items-center justify-between border-b border-line py-3 font-bold transition hover:text-maroon">
                    {i.name} <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading eyebrow="Client testimonials" title="What hiring managers say" />
          <div data-reveal className="mt-10">
            <Testimonials items={testimonials.filter((t) => t.audience === "client")} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="border-t border-line bg-paper-2/60 py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading eyebrow="Our team" title="The people you'll work with" intro="Speak directly to an experienced recruiter, not a call centre." />
          <div className="mt-12">
            <TeamGrid team={team} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="container-sw grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="Employer FAQ" title="Before you call" />
          <FaqList faqs={employerFaqs} />
        </div>
      </section>

      <CtaBand
        title="Have a role to fill?"
        body="Tell us about the position and your team. We'll give you an honest view of the market and how we'd approach the search."
        primary={{ href: "/contact?topic=hire", label: "Discuss a role" }}
        secondary={{ href: "/testimonials", label: "Read testimonials" }}
      />
    </>
  );
}
