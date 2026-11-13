import Link from "next/link";
import { getCaseStudies, getIndustries, getSettings } from "@/lib/wp";
import { FOUNDED_YEAR, GA_ID, SITE } from "@/lib/site";
import { Logo } from "./ui";
import { CookieSettingsLink } from "./CookieConsent";
import { PoweredBy } from "./PoweredBy";
import { IconArrow, IconLinkedIn, IconMail, IconPhone, IconPin } from "./icons";

export async function Footer() {
  const [industries, settings, caseStudies] = await Promise.all([getIndustries(), getSettings(), getCaseStudies()]);
  const year = new Date().getFullYear();

  const cols = [
    {
      title: "Hire & get hired",
      links: [
        { href: "/employers", label: "For employers" },
        { href: "/candidates", label: "For candidates" },
        { href: "/jobs", label: "Current jobs" },
        { href: "/contact?topic=register", label: "Register your resume" },
      ],
    },
    {
      title: "Industries",
      links: industries.map((i) => ({ href: `/industries/${i.slug}`, label: i.navLabel })),
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About & values" },
        { href: "/team", label: "Our team" },
        { href: "/testimonials", label: "Testimonials" },
        ...(caseStudies.length ? [{ href: "/case-studies", label: "Case studies" }] : []),
        { href: "/insights", label: "Insights" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact us" },
      ],
    },
  ];

  return (
    <footer className="on-dark bg-ink text-white">
      <div className="container-sw grid gap-12 py-16 md:py-20 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Logo variant="light" />
          <p className="mt-6 text-muted-dark">
            Sharpe Wysman connects quality employers with quality candidates. Integrity, expertise and professionalism are the cornerstones of our
            business.
          </p>
          <dl className="mt-8 space-y-3 text-sm tabular-nums">
            <div className="flex gap-3">
              <dt className="flex w-6 shrink-0 pt-0.5 text-gold"><IconPhone className="h-4 w-4" /><span className="sr-only">Call</span></dt>
              <dd>
                <a href={`tel:${settings.phoneHref}`} className="hover:text-gold">
                  {settings.phone}
                </a>
              </dd>
            </div>
            {settings.email ? (
              <div className="flex gap-3">
                <dt className="flex w-6 shrink-0 pt-0.5 text-gold"><IconMail className="h-4 w-4" /><span className="sr-only">Email</span></dt>
                <dd>
                  <a href={`mailto:${settings.email}`} className="break-all hover:text-gold">
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : null}
            <div className="flex gap-3">
              <dt className="flex w-6 shrink-0 pt-0.5 text-gold"><IconPin className="h-4 w-4" /><span className="sr-only">Office</span></dt>
              <dd>
                {settings.addressLocality}, {settings.addressRegion}, Canada
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="eyebrow text-gold">{c.title}</h2>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/80 transition hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-sw flex flex-col gap-4 py-6 text-sm text-muted-dark md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.legalName}. Recruiting in Vancouver since {FOUNDED_YEAR}.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <a href="#main" className="group inline-flex items-center gap-2 hover:text-gold">
                Back to top
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 transition group-hover:border-gold">
                  <IconArrow className="h-3.5 w-3.5 -rotate-90" />
                </span>
              </a>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-gold">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms-conditions" className="hover:text-gold">
                Terms & conditions
              </Link>
            </li>
            {GA_ID ? (
              <li>
                <CookieSettingsLink className="hover:text-gold" />
              </li>
            ) : null}
            <li>
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold">
                <IconLinkedIn className="h-4 w-4" />
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Studio signature */}
      <div className="border-t border-white/[0.06]">
        <div className="container-sw flex justify-center py-5">
          <PoweredBy tone="light" />
        </div>
      </div>
    </footer>
  );
}
