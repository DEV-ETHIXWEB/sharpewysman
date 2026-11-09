import Image from "next/image";
import Link from "next/link";
import { PageHero, SectionHeading, JsonLd, Arrow } from "@/option-2/components/ui";
import { ProcessOrbit } from "@/option-2/components/ProcessOrbit";
import { Testimonials } from "@/option-2/components/Testimonials";
import { FaqList } from "@/option-2/components/FaqList";
import { telHref } from "@/option-2/components/TeamGrid";
import { IconLinkedIn, IconPhone } from "@/option-2/components/icons";
import { CountUp } from "@/option-2/components/motion/CountUp";
import { CtaBand } from "@/option-2/components/CtaBand";
import { ServiceMark } from "@/option-2/components/ServiceMark";
import { IndustryCarousel } from "@/option-2/components/IndustryCarousel";
import { employerProcess, services } from "@/content/company";
import { getFaqs, getIndustries, getOpenJobs, getSettings, getTeam, getTestimonials } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hire Accountants & Finance Professionals in Vancouver",
  description:
    "Retained search, contingency search and workplace consulting for accounting and finance hires in Vancouver. Pre-qualified shortlists from recruiters who are designated accountants.",
  path: "/employers",
});

export default async function EmployersPage() {
  const [testimonials, faqs, settings, team, industries, jobs] = await Promise.all([
    getTestimonials(),
    getFaqs(),
    getSettings(),
    getTeam(),
    getIndustries(),
    getOpenJobs(),
  ]);
  const employerFaqs = faqs.filter((f) => f.audience !== "candidate");
  const openByIndustry = jobs.reduce<Record<string, number>>((acc, j) => ({ ...acc, [j.industry]: (acc[j.industry] ?? 0) + 1 }), {});

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
      <section className="on-dark border-t border-white/10 bg-ink py-20 text-white md:py-28">
        <div className="container-sw grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div data-reveal>
            <SectionHeading
              tone="dark"
              eyebrow="Why choose us"
              title="Fewer resumes. Better hires."
              intro="We connect top-tier accounting talent with leading companies, reaching people who aren't actively looking, screening for cultural fit as well as technical fit, and moving quickly without cutting corners."
            />
            <Link href="/about" className="btn btn-gold mt-10">
              Know more about us <Arrow />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {settings.stats.map((s, i) => {
              const tag = ["Years active", "Placements", "Client firms", "Designated CPAs"][i];
              return (
                <div
                  key={s.label}
                  data-reveal
                  style={{ ["--i" as string]: i }}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] md:p-7"
                >
                  <p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-white md:text-5xl">
                    <CountUp value={s.value} />
                  </p>
                  {tag ? (
                    <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-gold">
                      {tag}
                    </span>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-muted-dark">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="on-dark border-t border-white/10 bg-ink py-20 text-white md:py-28">
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
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading align="center" eyebrow="Our process" title="Four steps to the right hire" intro="A collaborative approach that keeps our search aligned with your vision, from first call to long after the start date." />
          <div data-reveal className="mt-12">
            <ProcessOrbit tracks={[{ id: "employers", label: "For employers", steps: employerProcess }]} />
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="on-dark bg-ink py-20 text-white md:py-28">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              tone="dark"
              eyebrow="Industries we serve"
              title="Staffing solutions across five fields"
              intro="Accounting and finance is our specialism. We also recruit for the teams that work alongside them."
            />
            <Link href="/industries" className="link-arrow shrink-0 text-white hover:text-gold">
              All industries <Arrow />
            </Link>
          </div>
          <div className="mt-10">
            <IndustryCarousel industries={industries} openByIndustry={openByIndustry} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading eyebrow="Client testimonials" title="What hiring managers say" />
        </div>
        {/* Outside the container so the rows run to both screen edges */}
        <div data-reveal className="mt-10">
          <Testimonials items={testimonials.filter((t) => t.audience === "client")} />
        </div>
      </section>

      {/* Team */}
      <section id="team" className="border-t border-line py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading align="center" eyebrow="Our team" title="Meet the recruiters" intro="Every search is led personally, start to finish, by one of these two." />
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {team.map((m, i) => (
              <div
                key={m.slug}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="grid overflow-hidden rounded-2xl border border-line bg-white transition duration-300 sm:grid-cols-[0.85fr_1.15fr] sm:items-stretch hover:-translate-y-1 hover:border-maroon/30 hover:shadow-xl hover:shadow-ink/10"
              >
                <div className="relative aspect-[4/5] bg-paper-2 sm:aspect-auto">
                  {m.image ? <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 35vw, 90vw" className="object-cover" /> : null}
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-maroon">{m.role}</p>
                  <h3 className="font-display mt-2 text-3xl">{m.name}</h3>
                  <p className="mt-4 text-muted">{m.bio[0]}</p>
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
                    {m.phone ? (
                      <a href={telHref(m.phone)} className="icon-inline min-h-6 hover:text-maroon">
                        <IconPhone className="h-4 w-4 text-maroon" />
                        {m.phone}
                      </a>
                    ) : null}
                    {m.linkedin ? (
                      <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="icon-inline min-h-6 hover:text-maroon">
                        <IconLinkedIn className="h-4 w-4 text-maroon" />
                        LinkedIn
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading align="center" eyebrow="Employer FAQ" title="Before you call" />
          <div className="mx-auto mt-12 max-w-4xl">
            <FaqList faqs={employerFaqs} />
          </div>
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
