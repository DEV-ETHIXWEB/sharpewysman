import Link from "next/link";
import { Hero, OpenRoles } from "@/option-2/components/home/Hero";
import { ProcessOrbit } from "@/option-2/components/ProcessOrbit";
import { Testimonials } from "@/option-2/components/Testimonials";
import { FaqList } from "@/option-2/components/FaqList";
import { IndustryCarousel } from "@/option-2/components/IndustryCarousel";
import { CtaBand } from "@/option-2/components/CtaBand";
import { ArticleCard } from "@/option-2/components/ArticleCard";
import { LogoCloud } from "@/option-2/components/home/LogoCloud";
import { AudienceCard } from "@/option-2/components/home/AudienceCard";
import { CountUp } from "@/option-2/components/motion/CountUp";
import { Arrow, JsonLd, SectionHeading, Tick } from "@/option-2/components/ui";
import { ServiceMark } from "@/option-2/components/ServiceMark";
import { candidateProcess, employerProcess, services } from "@/content/company";
import { getArticles, getFaqs, getIndustries, getOpenJobs, getSettings, getTestimonials } from "@/option-2/wp";
import { buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accounting & Finance Recruiters in Vancouver | Sharpe Wysman",
  description:
    "Vancouver accounting and finance recruitment by designated accountants. Since 2008 Sharpe Wysman has placed CPAs, tax and audit managers, controllers and CFOs across Greater Vancouver.",
  path: "/",
});

export default async function HomePage() {
  const [jobs, industries, testimonials, faqs, settings, articles] = await Promise.all([
    getOpenJobs(),
    getIndustries(),
    getTestimonials(),
    getFaqs(),
    getSettings(),
    getArticles(),
  ]);
  const openByIndustry = jobs.reduce<Record<string, number>>((acc, j) => ({ ...acc, [j.industry]: (acc[j.industry] ?? 0) + 1 }), {});
  const homeFaqs = faqs.slice(0, 5);
  const endorsers = Array.from(new Set(testimonials.map((t) => t.company)));

  return (
    <>
      <JsonLd data={faqLd(homeFaqs)} />
      <Hero totalOpen={jobs.length} stats={settings.stats} />

      {/* Endorsements: a quiet logo cloud that periodically reshuffles */}
      {endorsers.length ? (
        <section aria-label="Recommended by" className="border-b border-line bg-paper-2/40 py-12 md:py-16">
          <div className="container-sw">
            <p className="eyebrow text-center text-muted">Recommended by professionals at</p>
            <div className="mt-6">
              <LogoCloud items={endorsers} />
            </div>
          </div>
        </section>
      ) : null}

      <OpenRoles jobs={jobs.slice(0, 4)} totalOpen={jobs.length} />

      {/* Two audiences */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading
            eyebrow="Why Sharpe Wysman"
            title={
              <>
                Always professional. <span className="text-maroon">Never pushy.</span>
              </>
            }
            intro="We care about finding the right fit between employer and candidate. Our recruiters have all worked as accounting professionals, so we understand what you do, what you're aiming for and the challenges you face."
          />
          <div className="audience-grid mt-14 grid gap-5 md:grid-cols-2">
            {[
              {
                eyebrow: "For employers",
                title: "Access hard-to-find accounting talent",
                body: "Senior hires, confidential searches and specialist skill sets, screened by people who have done the job themselves.",
                points: ["Pre-qualified shortlists only", "Confidential leadership searches", "Follow-up long after the offer"],
                href: "/employers",
                cta: "How we help employers",
                image: "/images/team-meeting.jpg",
              },
              {
                eyebrow: "For candidates",
                title: "Make your aspirations a reality",
                body: "Roles in public practice and industry, many never advertised, with honest advice at every stage and no pressure to accept.",
                points: ["Free and confidential", "Interview coaching and preparation", "Offer and negotiation support"],
                href: "/candidates",
                cta: "How we help candidates",
                image: "/images/candidate-interview.jpg",
              },
            ].map((c, i) => (
              <AudienceCard key={c.href} data={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="on-dark bg-ink py-16 text-white md:py-20">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading tone="dark" eyebrow="Client services" title="Three ways to hire with us" />
            <Link href="/employers#services" className="link-arrow text-gold">
              Compare services <Arrow />
            </Link>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-line-dark md:grid-cols-3">
            {services.map((s, i) => (
              <article
                key={s.slug}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="group flip-card h-[19rem] transition duration-500 hover:-translate-y-1 md:h-[21rem]"
              >
                <div className="flip-card-inner">
                  {/* Front: just enough to know what it is */}
                  <div data-glow className="flip-card-face flex flex-col bg-ink-2 p-6 transition-colors duration-500 group-hover:bg-[#2e2d31] md:p-7">
                    <ServiceMark slug={s.slug} />
                    <h3 className="mt-5 text-xl text-white md:text-[1.4rem]">{s.title}</h3>
                    <p className="mt-2 font-serif text-base text-gold">{s.lede}</p>
                    <span className="mt-auto flex items-center gap-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-white/40 motion-reduce:hidden [@media(hover:none)]:hidden">
                      Hover to read more
                    </span>
                  </div>

                  {/* Back: the detail, only on hover/focus */}
                  <div data-glow className="flip-card-face flip-card-back flex flex-col bg-[#2e2d31] p-6 md:p-7">
                    <h3 className="text-lg text-white">{s.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-dark">{s.body}</p>
                    <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[0.65rem] uppercase tracking-widest text-white/60">Best for: {s.bestFor}</p>
                    <Link href={`/contact?topic=hire&service=${s.slug}`} className="link-arrow mt-4 text-sm text-gold">
                      Enquire <Arrow className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Record */}
      <section className="py-20 md:py-28">
        <div className="container-sw grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div data-reveal>
            <p className="eyebrow text-maroon">By the numbers</p>
            <h2 className="mt-4 text-[2.1rem] md:text-5xl">Nearly two decades of results, not promises</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Every search we run adds to this record: the numbers behind our accounting and finance recruitment in Vancouver since 2008.
            </p>
            <Link href="/about" className="btn btn-ink mt-10">
              Our story and values <Arrow />
            </Link>
          </div>

          <div>
            {settings.stats.map((s, i) => {
              const last = i === settings.stats.length - 1;
              return (
                <div
                  key={s.label}
                  data-reveal
                  style={{ ["--i" as string]: i, marginTop: i === 0 ? 0 : -10, marginLeft: `${(settings.stats.length - 1 - i) * 5}%` }}
                  className={`group/stat relative flex min-h-[7rem] items-center justify-between gap-5 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-0.5 md:min-h-[7.5rem] md:p-7 ${
                    last
                      ? "bg-maroon text-white shadow-[0_24px_50px_-20px_rgb(128_25_33/0.45)] hover:shadow-[0_28px_56px_-18px_rgb(128_25_33/0.55)]"
                      : "border border-line/70 bg-white shadow-[0_18px_36px_-28px_rgb(30_29_31/0.3)] hover:border-line hover:shadow-[0_22px_40px_-24px_rgb(30_29_31/0.18)]"
                  }`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className={`font-mono text-3xl font-medium tracking-tight tabular-nums md:text-4xl ${last ? "text-gold" : "text-ink"}`}>
                      <CountUp value={s.value} />
                    </span>
                    <span className={`max-w-[11rem] text-sm leading-snug ${last ? "text-white/80" : "text-muted"}`}>
                      {s.label}
                      {s.note ? <span className="mt-0.5 block text-xs opacity-70">{s.note}</span> : null}
                    </span>
                  </div>
                  <Tick
                    animate
                    delay={0.4 + i * 0.15}
                    className={`h-4 w-5 shrink-0 transition-transform duration-500 group-hover/stat:scale-110 ${last ? "text-gold" : "text-maroon"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-line bg-paper-2/60 py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title="A clear process, from first call to first day"
            intro="Whichever side of the hire you're on, you'll always know what happens next."
          />
          <div data-reveal className="mt-12 flex flex-col items-center">
            <ProcessOrbit
              tracks={[
                { id: "employers", label: "For employers", steps: employerProcess },
                { id: "candidates", label: "For candidates", steps: candidateProcess },
              ]}
            />
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
              title="Deep in accounting. Trusted beyond it."
              intro="Our expertise spans accounting and finance in public practice and industry, plus the specialist teams that work alongside them."
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
      <section className="on-dark border-t border-white/10 bg-ink py-20 text-white md:py-28">
        <div className="container-sw">
          <SectionHeading tone="dark" eyebrow="In their words" title="Don't take our word for it" />
          <div data-reveal className="mt-10">
            <Testimonials items={testimonials} tone="dark" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-sw grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Questions" title="Good questions, straight answers" intro="Honesty is how we work. Here are the questions we hear most." />
            <Link href="/faq" className="link-arrow mt-8">
              All questions <Arrow />
            </Link>
          </div>
          <FaqList faqs={homeFaqs} />
        </div>
      </section>

      {/* Insights */}
      {articles.length ? (
        <section className="border-t border-line bg-white py-20 md:py-28">
          <div className="container-sw">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Insights" title="Advice for accounting careers and hiring" />
              <Link href="/insights" className="link-arrow shrink-0">
                All insights <Arrow />
              </Link>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {articles.slice(0, 3).map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        title="Let's talk about your next hire, or your next role."
        body="A short, confidential conversation with a recruiter who understands accounting. No pressure, no obligation."
      />
    </>
  );
}
