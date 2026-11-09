import { Suspense } from "react";
import { JsonLd, PageHero } from "@/option-2/components/ui";
import { EnquiryForm } from "@/option-2/components/EnquiryForm";
import { IconArrowUpRight, IconLinkedIn, IconMail, IconPhone, IconPin } from "@/option-2/components/icons";
import { telHref } from "@/option-2/components/TeamGrid";
import { getSettings, getTeam } from "@/option-2/wp";
import { abs, breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Sharpe Wysman | Vancouver Recruitment",
  description:
    "Talk to a Vancouver accounting and finance recruiter. Discuss a role you need to fill, register your resume, or ask a question. We reply within one business day.",
  path: "/contact",
});

export default async function ContactPage() {
  const [settings, team] = await Promise.all([getSettings(), getTeam()]);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Contact", path: "/contact" }]),
          { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Sharpe Wysman", url: abs("/contact") },
        ]}
      />
      <PageHero
        eyebrow="Get in touch"
        title={
          <>
            Start with a <span className="text-gold">confidential conversation.</span>
          </>
        }
        intro="Hiring, looking for your next role, or just exploring the market? Tell us a little about it and we'll reply within one business day."
        image="/images/vancouver-skyline.jpg"
        caption="Vancouver, BC. We reply within one business day."
      />
      <section className="py-16 md:py-24">
        <div className="container-sw grid gap-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
          <Suspense fallback={<div className="h-[40rem] rounded-xl border border-line bg-white" />}>
            <EnquiryForm mode="contact" phone={settings.phone} phoneHref={settings.phoneHref} />
          </Suspense>

          <aside className="space-y-10">
            <div data-reveal className="rounded-xl bg-ink p-7 text-white">
              <h2 className="eyebrow text-gold">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {[
                  ["Within one business day", "A recruiter (not a bot) reads your message and replies personally."],
                  ["A confidential call", "A 15 to 20 minute call to understand your role, or your goals and situation."],
                  ["A clear plan", "We tell you honestly how we'd approach it, and what to expect next."],
                ].map(([t, b], i) => (
                  <li key={t} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 font-mono text-xs text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-bold">{t}</p>
                      <p className="mt-1 text-sm text-muted-dark">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div data-reveal style={{ ["--i" as string]: 1 }}>
              <h2 className="eyebrow text-maroon">Call us</h2>
              <ul className="mt-4 space-y-4">
                {team
                  .filter((m) => m.phone)
                  .map((m) => (
                    <li key={m.slug}>
                      <a href={telHref(m.phone!)} className="icon-inline text-2xl font-bold tabular-nums tracking-tight hover:text-maroon">
                        <IconPhone className="h-5 w-5 text-maroon" />
                        {m.phone}
                      </a>
                      <p className="text-sm text-muted">
                        {m.name}, {m.role}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
            {settings.email ? (
              <div data-reveal style={{ ["--i" as string]: 2 }}>
                <h2 className="eyebrow text-maroon">Email</h2>
                <a href={`mailto:${settings.email}`} className="icon-inline mt-4 break-all text-xl font-bold hover:text-maroon">
                  <IconMail className="h-5 w-5 shrink-0 text-maroon" />
                  {settings.email}
                </a>
              </div>
            ) : null}
            <div data-reveal style={{ ["--i" as string]: 2 }}>
              <h2 className="eyebrow text-maroon">Office</h2>
              <p className="mt-4 flex gap-2 text-xl">
                <IconPin className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <span>
                {settings.addressLocality}, {settings.addressRegion}
                <br />
                Canada
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">Serving employers and candidates across Greater Vancouver.</p>
            </div>
            <div data-reveal style={{ ["--i" as string]: 3 }}>
              <h2 className="eyebrow text-maroon">Follow</h2>
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="link-arrow mt-4">
                <IconLinkedIn className="h-4 w-4 text-maroon" />
                LinkedIn
                <IconArrowUpRight className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
