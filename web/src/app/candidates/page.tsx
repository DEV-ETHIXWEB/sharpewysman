import Image from "next/image";
import Link from "next/link";
import { Arrow, JsonLd, PageHero, SectionHeading, TickList } from "@/components/ui";
import { ProcessOrbit } from "@/components/ProcessOrbit";
import { Testimonials } from "@/components/Testimonials";
import { FaqList } from "@/components/FaqList";
import { JobRow } from "@/components/JobBits";
import { CtaBand } from "@/components/CtaBand";
import { candidateProcess } from "@/content/company";
import { getFaqs, getIndustries, getOpenJobs, getSettings, getTestimonials } from "@/lib/wp";
import { breadcrumbLd, buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accounting & Finance Jobs in Vancouver for CPAs",
  description:
    "Find your next accounting, tax, audit or finance leadership role in Vancouver. Free, confidential career support from recruiters who are designated accountants.",
  path: "/candidates",
});

export default async function CandidatesPage() {
  const [jobs, testimonials, faqs, industries, settings] = await Promise.all([getOpenJobs(), getTestimonials(), getFaqs(), getIndustries(), getSettings()]);
  const names = Object.fromEntries(industries.map((i) => [i.slug, i.name]));
  const candidateFaqs = faqs.filter((f) => f.audience !== "employer");

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Candidates", path: "/candidates" }]), faqLd(candidateFaqs)]} />
      <PageHero
        eyebrow="For candidates"
        title={
          <>
            Your career, <span className="font-serif italic text-gold">advised by people who&rsquo;ve done the job.</span>
          </>
        }
        intro="Your career advancement and wellbeing come first. Our recruiters are all designated accountants, dedicated to connecting you with opportunities that genuinely fit your goals."
        crumbs={[{ name: "Candidates" }]}
        image="/images/candidate-interview.jpg"
      >
        <Link href="/jobs" className="btn btn-gold">
          Browse {jobs.length} open roles <Arrow />
        </Link>
        <Link href="/contact?topic=register" className="btn btn-ghost-light">
          Register your resume
        </Link>
      </PageHero>

      {/* Exemplary service */}
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading eyebrow="Exemplary service" title="What you get when you work with us" intro="It's free for candidates, always confidential, and you'll never be pushed to accept an offer." />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              ["Exclusive opportunities", "A curated selection of roles matched to your expertise and goals, many of which are never advertised."],
              ["Personalized guidance", "Recruiters who understand the nuances of the profession and give you honest insight into each firm and role."],
              ["Comprehensive support", "From the first conversation to your first day, and beyond. A transparent process at every step."],
            ].map(([t, b], i) => (
              <article
                key={t}
                data-reveal
                data-glow
                style={{ ["--i" as string]: i, ["--glow" as string]: "rgb(128 25 33 / 0.06)" }}
                className="rounded-xl border border-line bg-white p-8 transition duration-500 hover:-translate-y-1 hover:border-ink"
              >
                <span className="font-mono text-xs text-maroon">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[1.75rem]">{t}</h3>
                <p className="mt-3 text-muted">{b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-line bg-paper-2/60 py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading align="center" eyebrow="Our process" title="Six steps to your next role" intro="Ready to make your aspirations a reality? Here's exactly what happens after you get in touch." />
          <div data-reveal className="mt-12">
            <ProcessOrbit tracks={[{ id: "candidates", label: "For candidates", steps: candidateProcess }]} />
          </div>
        </div>
      </section>

      {/* Latest jobs */}
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Current opportunities" title="Latest roles" />
            <Link href="/jobs" className="link-arrow shrink-0">
              View all jobs <Arrow />
            </Link>
          </div>
          <ul data-reveal className="mt-10 border-t border-ink">
            {jobs.slice(0, 5).map((j) => (
              <JobRow key={j.slug} job={j} industryName={names[j.industry]} />
            ))}
          </ul>
        </div>
      </section>

      {/* Interview prep */}
      <section className="on-dark bg-ink py-20 text-white md:py-28">
        <div className="container-sw grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Job interview preparation"
              title="Walk in prepared"
              intro="We prepare every candidate with guides and checklists tailored to the industries we serve, so you go in confident and present your best self."
            />
            <TickList
              tone="dark"
              className="mt-8 text-white/90"
              items={[
                "Key interview tips and common questions for your field",
                "Insight into the firm, the team and the role's expectations",
                "Coaching on answers to the more difficult questions",
                "Support with offers, negotiation and contract review",
              ]}
            />
            <Link href="/contact?topic=register" className="btn btn-gold mt-10">
              Talk to a recruiter <Arrow />
            </Link>
          </div>
          <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image src="/images/professional-downtown.jpg" alt="A professional walking through a downtown plaza" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container-sw">
          <SectionHeading eyebrow="Candidate testimonials" title="Careers we've helped move forward" />
          <div data-reveal className="mt-10">
            <Testimonials items={testimonials.filter((t) => t.audience === "candidate")} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-white py-20 md:py-28">
        <div className="container-sw grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Candidate FAQ" title="Your questions, answered" />
            <p className="mt-6 text-muted">
              Connect with us on{" "}
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-maroon underline underline-offset-4">
                LinkedIn
              </a>{" "}
              for the latest job updates and career advice.
            </p>
          </div>
          <FaqList faqs={candidateFaqs} />
        </div>
      </section>

      <CtaBand
        title="Open the door to opportunity."
        body="Send us your resume in confidence, and we'll be in touch when the right role comes up."
        primary={{ href: "/contact?topic=register", label: "Register your resume" }}
        secondary={{ href: "/jobs", label: "Browse jobs" }}
      />
    </>
  );
}
